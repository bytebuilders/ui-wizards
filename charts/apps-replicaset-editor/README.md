# ReplicaSet Editor

[ReplicaSet Editor by AppsCode](https://byte.builders) - ReplicaSet Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install apps-replicaset-editor bytebuilders-ui/apps-replicaset-editor -n default
```

## Introduction

This chart deploys a ReplicaSet Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `apps-replicaset-editor`:

```console
$ helm install apps-replicaset-editor bytebuilders-ui/apps-replicaset-editor -n default
```

The command deploys a ReplicaSet Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `apps-replicaset-editor`:

```console
$ helm delete apps-replicaset-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `apps-replicaset-editor` chart and their default values.

|     Parameter      | Description |   Default    |
|--------------------|-------------|--------------|
| apiVersion         |             | `apps/v1`    |
| kind               |             | `ReplicaSet` |
| metadata.name      |             | `replicaset` |
| metadata.namespace |             | `default`    |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install apps-replicaset-editor bytebuilders-ui/apps-replicaset-editor -n default --set apiVersion=apps/v1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install apps-replicaset-editor bytebuilders-ui/apps-replicaset-editor -n default --values values.yaml
```
