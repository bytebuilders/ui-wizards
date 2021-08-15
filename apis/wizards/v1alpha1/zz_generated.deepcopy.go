// +build !ignore_autogenerated

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

// Code generated by deepcopy-gen. DO NOT EDIT.

package v1alpha1

import (
	runtime "k8s.io/apimachinery/pkg/runtime"
)

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *AuthSecret) DeepCopyInto(out *AuthSecret) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new AuthSecret.
func (in *AuthSecret) DeepCopy() *AuthSecret {
	if in == nil {
		return nil
	}
	out := new(AuthSecret)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *ElasticsearchNode) DeepCopyInto(out *ElasticsearchNode) {
	*out = *in
	out.Persistence = in.Persistence
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ElasticsearchNode.
func (in *ElasticsearchNode) DeepCopy() *ElasticsearchNode {
	if in == nil {
		return nil
	}
	out := new(ElasticsearchNode)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *ElasticsearchTopology) DeepCopyInto(out *ElasticsearchTopology) {
	*out = *in
	out.Master = in.Master
	out.Data = in.Data
	out.DataContent = in.DataContent
	out.DataHot = in.DataHot
	out.DataWarm = in.DataWarm
	out.DataCold = in.DataCold
	out.DataFrozen = in.DataFrozen
	out.Ingest = in.Ingest
	out.Ml = in.Ml
	out.Transform = in.Transform
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new ElasticsearchTopology.
func (in *ElasticsearchTopology) DeepCopy() *ElasticsearchTopology {
	if in == nil {
		return nil
	}
	out := new(ElasticsearchTopology)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomElasticsearchEditorOptions) DeepCopyInto(out *KubedbcomElasticsearchEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomElasticsearchEditorOptions.
func (in *KubedbcomElasticsearchEditorOptions) DeepCopy() *KubedbcomElasticsearchEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomElasticsearchEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomElasticsearchEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomElasticsearchEditorOptionsList) DeepCopyInto(out *KubedbcomElasticsearchEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomElasticsearchEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomElasticsearchEditorOptionsList.
func (in *KubedbcomElasticsearchEditorOptionsList) DeepCopy() *KubedbcomElasticsearchEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomElasticsearchEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomElasticsearchEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomElasticsearchEditorOptionsSpec) DeepCopyInto(out *KubedbcomElasticsearchEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomElasticsearchEditorOptionsSpec.
func (in *KubedbcomElasticsearchEditorOptionsSpec) DeepCopy() *KubedbcomElasticsearchEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomElasticsearchEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomElasticsearchEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomElasticsearchEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Replicas != nil {
		in, out := &in.Replicas, &out.Replicas
		*out = new(int)
		**out = **in
	}
	if in.Topology != nil {
		in, out := &in.Topology, &out.Topology
		*out = new(ElasticsearchTopology)
		**out = **in
	}
	out.StorageClass = in.StorageClass
	if in.Persistence != nil {
		in, out := &in.Persistence, &out.Persistence
		*out = new(Persistence)
		**out = **in
	}
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomElasticsearchEditorOptionsSpecSpec.
func (in *KubedbcomElasticsearchEditorOptionsSpecSpec) DeepCopy() *KubedbcomElasticsearchEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomElasticsearchEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMariadbEditorOptions) DeepCopyInto(out *KubedbcomMariadbEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMariadbEditorOptions.
func (in *KubedbcomMariadbEditorOptions) DeepCopy() *KubedbcomMariadbEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMariadbEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMariadbEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMariadbEditorOptionsList) DeepCopyInto(out *KubedbcomMariadbEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomMariadbEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMariadbEditorOptionsList.
func (in *KubedbcomMariadbEditorOptionsList) DeepCopy() *KubedbcomMariadbEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMariadbEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMariadbEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMariadbEditorOptionsSpec) DeepCopyInto(out *KubedbcomMariadbEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMariadbEditorOptionsSpec.
func (in *KubedbcomMariadbEditorOptionsSpec) DeepCopy() *KubedbcomMariadbEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMariadbEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMariadbEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomMariadbEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMariadbEditorOptionsSpecSpec.
func (in *KubedbcomMariadbEditorOptionsSpecSpec) DeepCopy() *KubedbcomMariadbEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMariadbEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMemcachedEditorOptions) DeepCopyInto(out *KubedbcomMemcachedEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMemcachedEditorOptions.
func (in *KubedbcomMemcachedEditorOptions) DeepCopy() *KubedbcomMemcachedEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMemcachedEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMemcachedEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMemcachedEditorOptionsList) DeepCopyInto(out *KubedbcomMemcachedEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomMemcachedEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMemcachedEditorOptionsList.
func (in *KubedbcomMemcachedEditorOptionsList) DeepCopy() *KubedbcomMemcachedEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMemcachedEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMemcachedEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMemcachedEditorOptionsSpec) DeepCopyInto(out *KubedbcomMemcachedEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMemcachedEditorOptionsSpec.
func (in *KubedbcomMemcachedEditorOptionsSpec) DeepCopy() *KubedbcomMemcachedEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMemcachedEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMemcachedEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomMemcachedEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMemcachedEditorOptionsSpecSpec.
func (in *KubedbcomMemcachedEditorOptionsSpecSpec) DeepCopy() *KubedbcomMemcachedEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMemcachedEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMongodbEditorOptions) DeepCopyInto(out *KubedbcomMongodbEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMongodbEditorOptions.
func (in *KubedbcomMongodbEditorOptions) DeepCopy() *KubedbcomMongodbEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMongodbEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMongodbEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMongodbEditorOptionsList) DeepCopyInto(out *KubedbcomMongodbEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomMongodbEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMongodbEditorOptionsList.
func (in *KubedbcomMongodbEditorOptionsList) DeepCopy() *KubedbcomMongodbEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMongodbEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMongodbEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMongodbEditorOptionsSpec) DeepCopyInto(out *KubedbcomMongodbEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMongodbEditorOptionsSpec.
func (in *KubedbcomMongodbEditorOptionsSpec) DeepCopy() *KubedbcomMongodbEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMongodbEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMongodbEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomMongodbEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.ReplicaSet = in.ReplicaSet
	out.ShardTopology = in.ShardTopology
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMongodbEditorOptionsSpecSpec.
func (in *KubedbcomMongodbEditorOptionsSpecSpec) DeepCopy() *KubedbcomMongodbEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMongodbEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMysqlEditorOptions) DeepCopyInto(out *KubedbcomMysqlEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMysqlEditorOptions.
func (in *KubedbcomMysqlEditorOptions) DeepCopy() *KubedbcomMysqlEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMysqlEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMysqlEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMysqlEditorOptionsList) DeepCopyInto(out *KubedbcomMysqlEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomMysqlEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMysqlEditorOptionsList.
func (in *KubedbcomMysqlEditorOptionsList) DeepCopy() *KubedbcomMysqlEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMysqlEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomMysqlEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMysqlEditorOptionsSpec) DeepCopyInto(out *KubedbcomMysqlEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMysqlEditorOptionsSpec.
func (in *KubedbcomMysqlEditorOptionsSpec) DeepCopy() *KubedbcomMysqlEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMysqlEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomMysqlEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomMysqlEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.Group = in.Group
	out.InnoDBCluster = in.InnoDBCluster
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomMysqlEditorOptionsSpecSpec.
func (in *KubedbcomMysqlEditorOptionsSpecSpec) DeepCopy() *KubedbcomMysqlEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomMysqlEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomPostgresEditorOptions) DeepCopyInto(out *KubedbcomPostgresEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomPostgresEditorOptions.
func (in *KubedbcomPostgresEditorOptions) DeepCopy() *KubedbcomPostgresEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomPostgresEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomPostgresEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomPostgresEditorOptionsList) DeepCopyInto(out *KubedbcomPostgresEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomPostgresEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomPostgresEditorOptionsList.
func (in *KubedbcomPostgresEditorOptionsList) DeepCopy() *KubedbcomPostgresEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomPostgresEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomPostgresEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomPostgresEditorOptionsSpec) DeepCopyInto(out *KubedbcomPostgresEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomPostgresEditorOptionsSpec.
func (in *KubedbcomPostgresEditorOptionsSpec) DeepCopy() *KubedbcomPostgresEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomPostgresEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomPostgresEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomPostgresEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomPostgresEditorOptionsSpecSpec.
func (in *KubedbcomPostgresEditorOptionsSpecSpec) DeepCopy() *KubedbcomPostgresEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomPostgresEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomRedisEditorOptions) DeepCopyInto(out *KubedbcomRedisEditorOptions) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ObjectMeta.DeepCopyInto(&out.ObjectMeta)
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomRedisEditorOptions.
func (in *KubedbcomRedisEditorOptions) DeepCopy() *KubedbcomRedisEditorOptions {
	if in == nil {
		return nil
	}
	out := new(KubedbcomRedisEditorOptions)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomRedisEditorOptions) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomRedisEditorOptionsList) DeepCopyInto(out *KubedbcomRedisEditorOptionsList) {
	*out = *in
	out.TypeMeta = in.TypeMeta
	in.ListMeta.DeepCopyInto(&out.ListMeta)
	if in.Items != nil {
		in, out := &in.Items, &out.Items
		*out = make([]KubedbcomRedisEditorOptions, len(*in))
		for i := range *in {
			(*in)[i].DeepCopyInto(&(*out)[i])
		}
	}
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomRedisEditorOptionsList.
func (in *KubedbcomRedisEditorOptionsList) DeepCopy() *KubedbcomRedisEditorOptionsList {
	if in == nil {
		return nil
	}
	out := new(KubedbcomRedisEditorOptionsList)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyObject is an autogenerated deepcopy function, copying the receiver, creating a new runtime.Object.
func (in *KubedbcomRedisEditorOptionsList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	}
	return nil
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomRedisEditorOptionsSpec) DeepCopyInto(out *KubedbcomRedisEditorOptionsSpec) {
	*out = *in
	out.Metadata = in.Metadata
	in.Spec.DeepCopyInto(&out.Spec)
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomRedisEditorOptionsSpec.
func (in *KubedbcomRedisEditorOptionsSpec) DeepCopy() *KubedbcomRedisEditorOptionsSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomRedisEditorOptionsSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *KubedbcomRedisEditorOptionsSpecSpec) DeepCopyInto(out *KubedbcomRedisEditorOptionsSpecSpec) {
	*out = *in
	if in.Annotations != nil {
		in, out := &in.Annotations, &out.Annotations
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	if in.Labels != nil {
		in, out := &in.Labels, &out.Labels
		*out = make(map[string]string, len(*in))
		for key, val := range *in {
			(*out)[key] = val
		}
	}
	out.Cluster = in.Cluster
	out.StorageClass = in.StorageClass
	out.Persistence = in.Persistence
	in.Resources.DeepCopyInto(&out.Resources)
	out.AuthSecret = in.AuthSecret
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new KubedbcomRedisEditorOptionsSpecSpec.
func (in *KubedbcomRedisEditorOptionsSpecSpec) DeepCopy() *KubedbcomRedisEditorOptionsSpecSpec {
	if in == nil {
		return nil
	}
	out := new(KubedbcomRedisEditorOptionsSpecSpec)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MongoDBConfigServer) DeepCopyInto(out *MongoDBConfigServer) {
	*out = *in
	out.Persistence = in.Persistence
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MongoDBConfigServer.
func (in *MongoDBConfigServer) DeepCopy() *MongoDBConfigServer {
	if in == nil {
		return nil
	}
	out := new(MongoDBConfigServer)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MongoDBMongos) DeepCopyInto(out *MongoDBMongos) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MongoDBMongos.
func (in *MongoDBMongos) DeepCopy() *MongoDBMongos {
	if in == nil {
		return nil
	}
	out := new(MongoDBMongos)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MongoDBReplicaSet) DeepCopyInto(out *MongoDBReplicaSet) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MongoDBReplicaSet.
func (in *MongoDBReplicaSet) DeepCopy() *MongoDBReplicaSet {
	if in == nil {
		return nil
	}
	out := new(MongoDBReplicaSet)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MongoDBShard) DeepCopyInto(out *MongoDBShard) {
	*out = *in
	out.Persistence = in.Persistence
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MongoDBShard.
func (in *MongoDBShard) DeepCopy() *MongoDBShard {
	if in == nil {
		return nil
	}
	out := new(MongoDBShard)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MongoDBShardTopology) DeepCopyInto(out *MongoDBShardTopology) {
	*out = *in
	out.Shard = in.Shard
	out.ConfigServer = in.ConfigServer
	out.Mongos = in.Mongos
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MongoDBShardTopology.
func (in *MongoDBShardTopology) DeepCopy() *MongoDBShardTopology {
	if in == nil {
		return nil
	}
	out := new(MongoDBShardTopology)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MySQLGroup) DeepCopyInto(out *MySQLGroup) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MySQLGroup.
func (in *MySQLGroup) DeepCopy() *MySQLGroup {
	if in == nil {
		return nil
	}
	out := new(MySQLGroup)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MySQLInnoDBCluster) DeepCopyInto(out *MySQLInnoDBCluster) {
	*out = *in
	out.Router = in.Router
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MySQLInnoDBCluster.
func (in *MySQLInnoDBCluster) DeepCopy() *MySQLInnoDBCluster {
	if in == nil {
		return nil
	}
	out := new(MySQLInnoDBCluster)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *MySQLRouter) DeepCopyInto(out *MySQLRouter) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new MySQLRouter.
func (in *MySQLRouter) DeepCopy() *MySQLRouter {
	if in == nil {
		return nil
	}
	out := new(MySQLRouter)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *Persistence) DeepCopyInto(out *Persistence) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new Persistence.
func (in *Persistence) DeepCopy() *Persistence {
	if in == nil {
		return nil
	}
	out := new(Persistence)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *RedisCluster) DeepCopyInto(out *RedisCluster) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new RedisCluster.
func (in *RedisCluster) DeepCopy() *RedisCluster {
	if in == nil {
		return nil
	}
	out := new(RedisCluster)
	in.DeepCopyInto(out)
	return out
}

// DeepCopyInto is an autogenerated deepcopy function, copying the receiver, writing into out. in must be non-nil.
func (in *StorageClass) DeepCopyInto(out *StorageClass) {
	*out = *in
	return
}

// DeepCopy is an autogenerated deepcopy function, copying the receiver, creating a new StorageClass.
func (in *StorageClass) DeepCopy() *StorageClass {
	if in == nil {
		return nil
	}
	out := new(StorageClass)
	in.DeepCopyInto(out)
	return out
}
