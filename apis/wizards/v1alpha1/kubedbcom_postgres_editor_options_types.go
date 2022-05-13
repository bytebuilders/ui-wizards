/*
Copyright AppsCode Inc. and Contributors

Licensed under the PolyForm Noncommercial License 1.0.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://github.com/appscode/licenses/raw/1.0.0/PolyForm-Noncommercial-1.0.0.md

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package v1alpha1

import (
	core "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "kubepack.dev/lib-app/api/v1alpha1"
)

// KubedbcomPostgresEditorOptions defines the schama for PostgreSQL Editor UI Options.

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// +kubebuilder:object:root=true
// +kubebuilder:resource:path=kubedbcompostgreseditoroptionss,singular=kubedbcompostgreseditoroptions
type KubedbcomPostgresEditorOptions struct {
	metav1.TypeMeta   `json:",inline,omitempty"`
	metav1.ObjectMeta `json:"metadata,omitempty"`
	Spec              KubedbcomPostgresEditorOptionsSpec `json:"spec,omitempty"`
}

// KubedbcomPostgresEditorOptionsSpec is the schema for PostgreSQL profile values file
type KubedbcomPostgresEditorOptionsSpec struct {
	api.Metadata `json:"metadata,omitempty"`
	Spec         KubedbcomPostgresEditorOptionsSpecSpec `json:"spec"`
	Form         KubedbcomPostgresEditorOptionsSpecForm `json:"form"`
}

type KubedbcomPostgresEditorOptionsSpecSpec struct {
	// +optional
	Annotations map[string]string `json:"annotations"`
	// +optional
	Labels            map[string]string         `json:"labels"`
	Version           string                    `json:"version"`
	Mode              PostgresMode              `json:"mode"`
	TerminationPolicy TerminationPolicy         `json:"terminationPolicy"`
	StorageClass      StorageClass              `json:"storageClass"`
	Persistence       Persistence               `json:"persistence"`
	Machine           MachineType               `json:"machine"`
	Resources         core.ResourceRequirements `json:"resources"`
	AuthSecret        AuthSecret                `json:"authSecret"`
	Monitoring        Monitoring                `json:"monitoring"`
}

type KubedbcomPostgresEditorOptionsSpecForm struct {
	Alert PostgresAlert `json:"alert"`
}

// *** Alerts *** //

type PostgresAlert struct {
	Enabled              bool                `json:"enabled"`
	Labels               map[string]string   `json:"labels"`
	Annotations          map[string]string   `json:"annotations"`
	AdditionalRuleLabels map[string]string   `json:"additionalRuleLabels"`
	Groups               PostgresAlertGroups `json:"groups"`
}

type PostgresAlertGroups struct {
	Database      PostgresDatabaseAlert `json:"database"`
	Provisioner   ProvisionerAlert      `json:"provisioner"`
	OpsManager    OpsManagerAlert       `json:"opsManager"`
	Stash         StashAlert            `json:"stash"`
	SchemaManager SchemaManagerAlert    `json:"schemaManager"`
}

type PostgresDatabaseAlert struct {
	Enabled bool                       `json:"enabled"`
	Rules   PostgresDatabaseAlertRules `json:"rules"`
}

type PostgresDatabaseAlertRules struct {
	PostgresInstanceDown           FixedAlert          `json:"postgresInstanceDown"`
	PostgresRestarted              IntValAlert         `json:"postgresRestarted"`
	PostgresqlExporterError        FixedAlert          `json:"postgresqlExporterError"`
	PostgresTooManyConnections     IntValAlert         `json:"postgresTooManyConnections"`
	PostgresqlNotEnoughConnections IntValAlert         `json:"postgresqlNotEnoughConnections"`
	PostgresSlowQueries            FixedAlert          `json:"postgresSlowQueries"`
	PostgresqlReplicationLag       StringValAlert      `json:"postgresqlReplicationLag"`
	PostgresqlHighRollbackRate     FloatValAlertConfig `json:"postgresqlHighRollbackRate"`
	PostgresqlSplitBrain           FixedAlert          `json:"postgresqlSplitBrain"`
	PostgresqlTooManyLocksAcquired FloatValAlertConfig `json:"postgresqlTooManyLocksAcquired"`
}

// *** Alerts *** //

// +kubebuilder:validation:Enum=Standalone;Cluster
type PostgresMode string

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// KubedbcomPostgresEditorOptionsList is a list of KubedbcomPostgresEditorOptionss
type KubedbcomPostgresEditorOptionsList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	// Items is a list of KubedbcomPostgresEditorOptions CRD objects
	Items []KubedbcomPostgresEditorOptions `json:"items,omitempty"`
}
