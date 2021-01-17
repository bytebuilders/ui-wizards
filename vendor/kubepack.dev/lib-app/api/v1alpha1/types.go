/*
Copyright AppsCode Inc. and Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1

import (
	"kubepack.dev/kubepack/apis/kubepack/v1alpha1"

	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
)

type ChartOrder struct {
	v1alpha1.ChartRepoRef `json:",inline"`

	ReleaseName string                     `json:"releaseName,omitempty"`
	Namespace   string                     `json:"namespace,omitempty"`
	Values      *unstructured.Unstructured `json:"values,omitempty"`
}

type EditorParameters struct {
	ValuesFile string `json:"valuesFile,omitempty"`
	// RFC 6902 compatible json patch. ref: http://jsonpatch.com
	// +optional
	// +kubebuilder:pruning:PreserveUnknownFields
	ValuesPatch *runtime.RawExtension `json:"valuesPatch,omitempty"`
}

type EditResourceOrder struct {
	Group    string `json:"group,omitempty"`
	Version  string `json:"version,omitempty"`
	Resource string `json:"resource,omitempty"`

	ReleaseName string `json:"releaseName,omitempty"`
	Namespace   string `json:"namespace,omitempty"`
	Values      string `json:"values,omitempty"`
}

type BucketFile struct {
	// URL of the file in bucket
	URL string `json:"url"`
	// Bucket key for this file
	Key      string `json:"key"`
	Filename string `json:"filename"`
	Data     []byte `json:"data"`
}

type BucketJsonFile struct {
	// URL of the file in bucket
	URL string `json:"url,omitempty"`
	// Bucket key for this file
	Key      string                     `json:"key,omitempty"`
	Filename string                     `json:"filename,omitempty"`
	Data     *unstructured.Unstructured `json:"data,omitempty"`
}

type BucketObject struct {
	// URL of the file in bucket
	URL string `json:"url"`
	// Bucket key for this file
	Key string `json:"key"`
}

type ChartTemplate struct {
	v1alpha1.ChartRef `json:",inline"`
	Version           string                       `json:"version,omitempty"`
	ReleaseName       string                       `json:"releaseName,omitempty"`
	Namespace         string                       `json:"namespace,omitempty"`
	CRDs              []BucketJsonFile             `json:"crds,omitempty"`
	Manifest          *BucketObject                `json:"manifest,omitempty"`
	Resources         []*unstructured.Unstructured `json:"resources,omitempty"`
}

type BucketFileOutput struct {
	// URL of the file in bucket
	URL string `json:"url,omitempty"`
	// Bucket key for this file
	Key      string `json:"key,omitempty"`
	Filename string `json:"filename,omitempty"`
	Data     string `json:"data,omitempty"`
}

type ChartTemplateOutput struct {
	v1alpha1.ChartRef `json:",inline"`
	Version           string             `json:"version,omitempty"`
	ReleaseName       string             `json:"releaseName,omitempty"`
	Namespace         string             `json:"namespace,omitempty"`
	CRDs              []BucketFileOutput `json:"crds,omitempty"`
	Manifest          *BucketObject      `json:"manifest,omitempty"`
	Resources         []string           `json:"resources,omitempty"`
}

type EditorTemplate struct {
	Manifest  []byte                       `json:"manifest,omitempty"`
	Values    *unstructured.Unstructured   `json:"values,omitempty"`
	Resources []*unstructured.Unstructured `json:"resources,omitempty"`
}

type ResourceOutput struct {
	CRDs      []string `json:"crds,omitempty"`
	Resources []string `json:"resources,omitempty"`
}

type ObjectModel struct {
	Key    string                     `json:"key"`
	Object *unstructured.Unstructured `json:"object"`
}
