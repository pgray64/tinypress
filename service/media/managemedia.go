/*
Package media is for services related to media storage and management

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package media

import (
	"github.com/google/uuid"
	"os"
	"path/filepath"
)

func TestImageDirectoryPath(imageDirectoryPath string) bool {
	randPart, err := uuid.NewRandom()
	if err != nil {
		return false
	}
	fileName := "test_" + randPart.String()
	fullPath := filepath.Join(imageDirectoryPath, fileName)

	// Ensure can write
	f, err := os.Create(fullPath)
	defer f.Close()
	if err != nil {
		return false
	}

	// Ensure can read
	_, err = os.ReadFile(fullPath)
	if err != nil {
		return false
	}

	// Ensure can delete
	err = os.Remove(fullPath)
	if err != nil {
		return false
	}

	return true
}
