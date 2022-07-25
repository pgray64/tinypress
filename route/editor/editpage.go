/*
Package editor is for routes related to page editing

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package editor

import (
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/service/page"
	"net/http"
	"strings"
	"time"
)

type createPageForm struct {
	Title         string `json:"title" validate:"required,max=255"`
	RenderedHtml  string `json:"renderedHtml"`
	RenderedCss   string `json:"renderedCss"`
	EditorContent string `json:"editorContent"`
}
type createPageResponse struct {
	PageId int `json:"pageId"`
}

func CreatePage(c echo.Context) error {
	formData := new(createPageForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
	}
	newPage := page.Page{
		Title: strings.TrimSpace(formData.Title),
	}
	newDraft := page.ContentRevision{
		PageId:        newPage.ID,
		RenderedHtml:  formData.RenderedHtml,
		RenderedCss:   formData.RenderedCss,
		EditorContent: formData.EditorContent,
	}
	newPageId, isDup, err := newPage.Create(&newDraft)
	if err != nil {
		return echo.ErrInternalServerError
	}
	if isDup {
		return echo.NewHTTPError(http.StatusBadRequest, "Title is already in use for another page")
	}
	return c.JSON(http.StatusOK, createPageResponse{
		PageId: newPageId,
	})
}

type getPageWithDraftRequest struct {
	PageId int `json:"pageId" validate:"required,min=1"`
}
type getPageWithDraftResponse struct {
	PageId         int       `json:"pageId"`
	PageTitle      string    `json:"pageTitle"`
	PageCreatedAt  time.Time `json:"pageCreatedAt"`
	DraftCreatedAt time.Time `json:"draftCreatedAt"`
	EditorContent  string    `json:"editorContent"`
}

func GetPageWithDraft(c echo.Context) error {
	request := new(getPageWithDraftRequest)
	if err := c.Bind(request); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(request); err != nil {
		return echo.ErrBadRequest
	}

	pageWithDraft, draft, err := page.GetPageWithDraft(request.PageId)
	if err != nil {
		return err
	}
	if pageWithDraft == nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Page does not exist")
	}
	return c.JSON(http.StatusOK, getPageWithDraftResponse{
		PageId:         pageWithDraft.ID,
		PageCreatedAt:  pageWithDraft.CreatedAt,
		DraftCreatedAt: draft.CreatedAt,
		EditorContent:  draft.EditorContent,
		PageTitle:      pageWithDraft.Title,
	})
}

type saveDraftRequest struct {
	PageId        int    `json:"pageId" validate:"required,min=1"`
	RenderedHtml  string `json:"renderedHtml"`
	RenderedCss   string `json:"renderedCss"`
	EditorContent string `json:"editorContent" validate:"required"`
}

func SaveDraft(c echo.Context) error {
	request := new(saveDraftRequest)
	if err := c.Bind(request); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(request); err != nil {
		return echo.ErrBadRequest
	}
	draft := page.ContentRevision{
		PageId:        request.PageId,
		RenderedHtml:  request.RenderedHtml,
		RenderedCss:   request.RenderedCss,
		EditorContent: request.EditorContent,
	}
	err := page.SaveDraft(&draft)
	if err != nil {
		return echo.ErrInternalServerError
	}
	return c.JSON(http.StatusOK, new(struct{}))
}

type publishDraftRequest struct {
	DraftId int `json:"draftId" validate:"required,min=1"`
}

func PublishDraft(c echo.Context) error {
	request := new(publishDraftRequest)
	if err := c.Bind(request); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(request); err != nil {
		return echo.ErrBadRequest
	}

	err := page.PublishDraft(request.DraftId)
	if err != nil {
		return echo.ErrInternalServerError
	}
	return c.JSON(http.StatusOK, new(struct{}))
}
