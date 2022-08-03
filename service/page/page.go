/*
Package page is for services related to website pages

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package page

import (
	"errors"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"github.com/pgray64/tinypress/database"
	"gorm.io/gorm"
	"time"
)

type Page struct {
	ID                  int    `gorm:"primaryKey;autoIncrement"`
	Title               string `gorm:"not null;size:255"`
	PublishedRevisionId *int
	PublishedRevision   ContentRevision `gorm:"PRELOAD:false"`
	CreatedAt           time.Time       `gorm:"autoCreateTime"`
	UpdatedAt           time.Time       `gorm:"autoUpdateTime"`
	DeletedAt           gorm.DeletedAt
}

// ContentRevision contains the content for every version of the page, with the latest one being the current revision
type ContentRevision struct {
	ID            int       `gorm:"primaryKey;autoIncrement"`
	PageId        int       `gorm:"not null;index:idx_content_revision_page_id;foreignKey:PageId"`
	RenderedHtml  string    `gorm:"not null"`
	RenderedCss   string    `gorm:"not null"`
	EditorContent string    `gorm:"not null"`
	CreatedAt     time.Time `gorm:"autoCreateTime"`
}

func (page *Page) Create(content *ContentRevision) (id int, isDup bool, err error) {
	insertPageRes := database.Database.Create(page)
	var pgErr *pgconn.PgError

	if insertPageRes.Error != nil {
		if insertPageRes.Error != nil && errors.As(insertPageRes.Error, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return 0, true, nil
		}
		return 0, false, insertPageRes.Error
	}

	content.PageId = page.ID
	insertContentRes := database.Database.Create(content)

	return page.ID, false, insertContentRes.Error

}

func GetPageWithDraft(pageId int) (*Page, *ContentRevision, error) {
	var pages []Page
	var drafts []ContentRevision
	var selectPageRes = database.Database.Model(&Page{}).Where(map[string]interface{}{"id": pageId}).Find(&pages)
	if selectPageRes.Error != nil {
		return nil, nil, selectPageRes.Error
	}
	if len(pages) < 1 {
		return nil, nil, nil
	}
	var selectDraftRes = database.Database.Model(&ContentRevision{}).
		Where(map[string]interface{}{"page_id": pageId}).
		Order("id desc").
		Limit(1).
		Find(&drafts)
	if selectDraftRes.Error != nil || len(drafts) < 1 {
		return &pages[0], nil, selectDraftRes.Error
	}
	return &pages[0], &drafts[0], nil
}

func SaveDraft(draft *ContentRevision) error {
	if draft.ID > 0 {
		return errors.New("you can only append to drafts")
	}
	insertRes := database.Database.Create(draft)
	return insertRes.Error
}

func UpdateRecentlyEditedPage(pageId int) error {
	if pageId < 1 {
		return errors.New("page id is invalid")
	}
	var updateRes = database.Database.Model(&Page{}).
		Where(map[string]interface{}{"id": pageId}).
		Updates(&Page{UpdatedAt: time.Now()})
	return updateRes.Error
}

func PublishDraft(draftId int) error {
	if draftId < 1 {
		return errors.New("draft id is invalid")
	}
	var drafts []ContentRevision
	// Doing this will prevent publishing a soft-deleted draft
	var selectRes = database.Database.Model(&ContentRevision{}).Where(map[string]interface{}{"id": draftId}).Find(&drafts)
	if selectRes.Error != nil {
		return selectRes.Error
	}
	if len(drafts) < 1 {
		return errors.New("draft does not exist")
	}
	draft := drafts[0]
	pageId := draft.PageId
	updateRes := database.Database.Where(map[string]interface{}{"id": pageId}).Updates(&Page{
		PublishedRevisionId: &draft.ID,
	})
	return updateRes.Error
}

func ListRecentlyEditedPages(page int, perPage int) (pages []Page, totalCount int64, err error) {
	countRes := database.Database.Model(&Page{}).Count(&totalCount)
	if countRes.Error != nil {
		return pages, 0, countRes.Error
	}
	offset := perPage * page
	var selectRes = database.Database.Model(&Page{}).
		Offset(offset).
		Limit(perPage).
		Order("updated_at desc").
		Find(&pages)
	return pages, totalCount, selectRes.Error
}
