# ClientTrafficPolicy Editor

[ClientTrafficPolicy Editor by AppsCode](https://byte.builders) - ClientTrafficPolicy Editor

## TL;DR;

```bash
$ helm repo add appscode-charts-oci https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo appscode-charts-oci/gatewayenvoyproxyio-clienttrafficpolicy-editor --version=v0.4.18
$ helm upgrade -i gatewayenvoyproxyio-clienttrafficpolicy-editor appscode-charts-oci/gatewayenvoyproxyio-clienttrafficpolicy-editor -n default --create-namespace --version=v0.4.18
```

## Introduction

This chart deploys a ClientTrafficPolicy Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.20+

## Installing the Chart

To install/upgrade the chart with the release name `gatewayenvoyproxyio-clienttrafficpolicy-editor`:

```bash
$ helm upgrade -i gatewayenvoyproxyio-clienttrafficpolicy-editor appscode-charts-oci/gatewayenvoyproxyio-clienttrafficpolicy-editor -n default --create-namespace --version=v0.4.18
```

The command deploys a ClientTrafficPolicy Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `gatewayenvoyproxyio-clienttrafficpolicy-editor`:

```bash
$ helm uninstall gatewayenvoyproxyio-clienttrafficpolicy-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `gatewayenvoyproxyio-clienttrafficpolicy-editor` chart and their default values.

|     Parameter      | Description |                   Default                   |
|--------------------|-------------|---------------------------------------------|
| apiVersion         |             | <code>gateway.envoyproxy.io/v1alpha1</code> |
| kind               |             | <code>ClientTrafficPolicy</code>            |
| metadata.name      |             | <code>clienttrafficpolicy</code>            |
| metadata.namespace |             | <code>default</code>                        |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i gatewayenvoyproxyio-clienttrafficpolicy-editor appscode-charts-oci/gatewayenvoyproxyio-clienttrafficpolicy-editor -n default --create-namespace --version=v0.4.18 --set apiVersion=gateway.envoyproxy.io/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i gatewayenvoyproxyio-clienttrafficpolicy-editor appscode-charts-oci/gatewayenvoyproxyio-clienttrafficpolicy-editor -n default --create-namespace --version=v0.4.18 --values values.yaml
```