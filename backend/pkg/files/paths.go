package files

import (
	"path"
	"path/filepath"
	"runtime"
)

func GetSchemaPath(schema string) string {
	// Current working directory
	wd := GetProjectPath()

	// Schema files location
	return filepath.Join(wd, "files", schema)
}

func GetProjectPath() string {
	_, filename, _, _ := runtime.Caller(0)
	dir := path.Join(path.Dir(filename), "../../")
	return dir
}
