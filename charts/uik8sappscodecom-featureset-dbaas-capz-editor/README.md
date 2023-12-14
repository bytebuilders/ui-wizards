# FeatureSet Editor

[FeatureSet Editor by AppsCode](https://byte.builders) - FeatureSet Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/uik8sappscodecom-featureset-dbaas-capz-editor --version=v0.4.18
$ helm upgrade -i uik8sappscodecom-featureset-dbaas-capz-editor bytebuilders-ui/uik8sappscodecom-featureset-dbaas-capz-editor -n default --create-namespace --version=v0.4.18
```

## Introduction

This chart deploys a FeatureSet Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.20+

## Installing the Chart

To install/upgrade the chart with the release name `uik8sappscodecom-featureset-dbaas-capz-editor`:

```bash
$ helm upgrade -i uik8sappscodecom-featureset-dbaas-capz-editor bytebuilders-ui/uik8sappscodecom-featureset-dbaas-capz-editor -n default --create-namespace --version=v0.4.18
```

The command deploys a FeatureSet Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `uik8sappscodecom-featureset-dbaas-capz-editor`:

```bash
$ helm uninstall uik8sappscodecom-featureset-dbaas-capz-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `uik8sappscodecom-featureset-dbaas-capz-editor` chart and their default values.

|                            Parameter                             | Description |                                                                                                                                                                                                                                                                                                                                                     Default                                                                                                                                                                                                                                                                                                                                                     |
|------------------------------------------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| metadata.resource.group                                          |             | <code>ui.k8s.appscode.com</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| metadata.resource.version                                        |             | <code>v1alpha1</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| metadata.resource.name                                           |             | <code>featuresets</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| metadata.resource.kind                                           |             | <code>FeatureSet</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| metadata.resource.scope                                          |             | <code>Cluster</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| metadata.release.name                                            |             | <code>RELEASE-NAME</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| metadata.release.namespace                                       |             | <code>default</code>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| resources.helmToolkitFluxcdIoHelmRelease_capi_cluster_presets    |             | <code>{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"labels":{"ace.appscode.com/feature":"capi-cluster-presets"},"name":"capi-cluster-presets","namespace":"kubeops"},"spec":{"chart":{"spec":{"chart":"capi-cluster-presets","sourceRef":{"kind":"HelmRepository","name":"appscode-charts-oci","namespace":"kubeops"},"version":"v2023.10.1"}},"install":{"crds":"CreateReplace","createNamespace":true,"remediation":{"retries":-1}},"interval":"5m","releaseName":"capi-cluster-presets","storageNamespace":"capi-cluster","targetNamespace":"capi-cluster","timeout":"30m","upgrade":{"crds":"CreateReplace","remediation":{"retries":-1}}}}</code>                       |
| resources.helmToolkitFluxcdIoHelmRelease_crossplane              |             | <code>{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"labels":{"ace.appscode.com/feature":"crossplane"},"name":"crossplane","namespace":"kubeops"},"spec":{"chart":{"spec":{"chart":"crossplane","sourceRef":{"kind":"HelmRepository","name":"appscode-charts-oci","namespace":"kubeops"},"version":"1.13.2"}},"install":{"crds":"CreateReplace","createNamespace":true,"remediation":{"retries":-1}},"interval":"5m","releaseName":"crossplane","storageNamespace":"crossplane-system","targetNamespace":"crossplane-system","timeout":"30m","upgrade":{"crds":"CreateReplace","remediation":{"retries":-1}}}}</code>                                                         |
| resources.helmToolkitFluxcdIoHelmRelease_kubeform_provider_azure |             | <code>{"apiVersion":"helm.toolkit.fluxcd.io/v2beta1","kind":"HelmRelease","metadata":{"labels":{"ace.appscode.com/feature":"kubeform-provider-azure"},"name":"kubeform-provider-azure","namespace":"kubeops"},"spec":{"chart":{"spec":{"chart":"kubeform-provider-azure","sourceRef":{"kind":"HelmRepository","name":"appscode-charts-oci","namespace":"kubeops"},"version":"v2023.11.1"}},"install":{"crds":"CreateReplace","createNamespace":true,"remediation":{"retries":-1}},"interval":"5m","releaseName":"kubeform-provider-azure","storageNamespace":"crossplane-system","targetNamespace":"crossplane-system","timeout":"30m","upgrade":{"crds":"CreateReplace","remediation":{"retries":-1}}}}</code> |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i uik8sappscodecom-featureset-dbaas-capz-editor bytebuilders-ui/uik8sappscodecom-featureset-dbaas-capz-editor -n default --create-namespace --version=v0.4.18 --set metadata.resource.group=ui.k8s.appscode.com
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i uik8sappscodecom-featureset-dbaas-capz-editor bytebuilders-ui/uik8sappscodecom-featureset-dbaas-capz-editor -n default --create-namespace --version=v0.4.18 --values values.yaml
```