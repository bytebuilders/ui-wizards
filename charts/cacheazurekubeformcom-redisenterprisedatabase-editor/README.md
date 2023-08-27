# RedisEnterpriseDatabase Editor

[RedisEnterpriseDatabase Editor by AppsCode](https://byte.builders) - RedisEnterpriseDatabase Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/cacheazurekubeformcom-redisenterprisedatabase-editor --version=v0.4.16
$ helm upgrade -i cacheazurekubeformcom-redisenterprisedatabase-editor bytebuilders-ui/cacheazurekubeformcom-redisenterprisedatabase-editor -n default --create-namespace --version=v0.4.16
```

## Introduction

This chart deploys a RedisEnterpriseDatabase Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install/upgrade the chart with the release name `cacheazurekubeformcom-redisenterprisedatabase-editor`:

```bash
$ helm upgrade -i cacheazurekubeformcom-redisenterprisedatabase-editor bytebuilders-ui/cacheazurekubeformcom-redisenterprisedatabase-editor -n default --create-namespace --version=v0.4.16
```

The command deploys a RedisEnterpriseDatabase Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `cacheazurekubeformcom-redisenterprisedatabase-editor`:

```bash
$ helm uninstall cacheazurekubeformcom-redisenterprisedatabase-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `cacheazurekubeformcom-redisenterprisedatabase-editor` chart and their default values.

|     Parameter      | Description |                    Default                     |
|--------------------|-------------|------------------------------------------------|
| apiVersion         |             | <code>cache.azure.kubeform.com/v1alpha1</code> |
| kind               |             | <code>RedisEnterpriseDatabase</code>           |
| metadata.name      |             | <code>redisenterprisedatabase</code>           |
| metadata.namespace |             | <code>""</code>                                |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i cacheazurekubeformcom-redisenterprisedatabase-editor bytebuilders-ui/cacheazurekubeformcom-redisenterprisedatabase-editor -n default --create-namespace --version=v0.4.16 --set apiVersion=cache.azure.kubeform.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i cacheazurekubeformcom-redisenterprisedatabase-editor bytebuilders-ui/cacheazurekubeformcom-redisenterprisedatabase-editor -n default --create-namespace --version=v0.4.16 --values values.yaml
```