/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import api from "../api";

const baseUrl = "/api/authed/v1/page-editor/";

export function createPageWithDefaults() {
  return createPage({
    title: "New page",
    renderedHtml: "",
    renderedCss: "",
    editorContent: "",
  });
}
export function createPage({
  title,
  renderedHtml,
  renderedCss,
  editorContent,
}) {
  return api.post(baseUrl + "create", {
    title,
    renderedHtml,
    renderedCss,
    editorContent,
  });
}

export function getPageWithDraft({ pageId }) {
  return api.post(baseUrl + "get-page-with-draft", {
    pageId,
  });
}

export function saveDraft({ title, renderedHtml, renderedCss, editorContent }) {
  return api.post(baseUrl + "save-draft", {
    title,
    renderedHtml,
    renderedCss,
    editorContent,
  });
}

export function publishDraft({ draftId }) {
  return api.post(baseUrl + "publish-draft", {
    draftId,
  });
}
