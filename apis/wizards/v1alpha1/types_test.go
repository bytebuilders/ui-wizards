/*
Copyright AppsCode Inc. and Contributors

Licensed under the AppsCode Free Trial License 1.0.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://github.com/appscode/licenses/raw/1.0.0/AppsCode-Free-Trial-1.0.0.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1_test

import (
	"os"
	"testing"

	"go.bytebuilders.dev/ui-wizards/apis/wizards/v1alpha1"

	schemachecker "kmodules.xyz/schema-checker"
)

func TestDefaultValues(t *testing.T) {
	checker := schemachecker.New(os.DirFS("../../.."),
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomElasticsearchEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomMariadbEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomMemcachedEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomMongodbEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomMysqlEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomPostgresEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomPgbouncerEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomProxysqlEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomRedisEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.KubedbcomKafkaEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.StashappscodecomRepositoryEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.StashappscodecomRestoresessionEditorOptionsSpec{}},
		schemachecker.TestCase{Obj: v1alpha1.StoragekubestashcomBackupstorageEditorOptionsSpec{}},
	)
	checker.TestAll(t)
}
