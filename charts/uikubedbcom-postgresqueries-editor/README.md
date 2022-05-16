# PostgresQueries Editor

[PostgresQueries Editor by AppsCode](https://byte.builders) - PostgresQueries Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/uikubedbcom-postgresqueries-editor --version=v0.4.4
$ helm upgrade -i uikubedbcom-postgresqueries-editor bytebuilders-ui/uikubedbcom-postgresqueries-editor -n default --create-namespace --version=v0.4.4
```

## Introduction

This chart deploys a PostgresQueries Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install/upgrade the chart with the release name `uikubedbcom-postgresqueries-editor`:

```bash
$ helm upgrade -i uikubedbcom-postgresqueries-editor bytebuilders-ui/uikubedbcom-postgresqueries-editor -n default --create-namespace --version=v0.4.4
```

The command deploys a PostgresQueries Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `uikubedbcom-postgresqueries-editor`:

```bash
$ helm uninstall uikubedbcom-postgresqueries-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `uikubedbcom-postgresqueries-editor` chart and their default values.

|     Parameter      | Description |               Default               |
|--------------------|-------------|-------------------------------------|
| apiVersion         |             | <code>ui.kubedb.com/v1alpha1</code> |
| kind               |             | <code>PostgresQueries</code>        |
| metadata.name      |             | <code>postgresqueries</code>        |
| metadata.namespace |             | <code>default</code>                |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i uikubedbcom-postgresqueries-editor bytebuilders-ui/uikubedbcom-postgresqueries-editor -n default --create-namespace --version=v0.4.4 --set apiVersion=ui.kubedb.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i uikubedbcom-postgresqueries-editor bytebuilders-ui/uikubedbcom-postgresqueries-editor -n default --create-namespace --version=v0.4.4 --values values.yaml
```