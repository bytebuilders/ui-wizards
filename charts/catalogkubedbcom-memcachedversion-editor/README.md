# MemcachedVersion Editor

[MemcachedVersion Editor by AppsCode](https://byte.builders) - MemcachedVersion Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install catalogkubedbcom-memcachedversion-editor bytebuilders-ui/catalogkubedbcom-memcachedversion-editor -n default
```

## Introduction

This chart deploys a MemcachedVersion Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `catalogkubedbcom-memcachedversion-editor`:

```console
$ helm install catalogkubedbcom-memcachedversion-editor bytebuilders-ui/catalogkubedbcom-memcachedversion-editor -n default
```

The command deploys a MemcachedVersion Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `catalogkubedbcom-memcachedversion-editor`:

```console
$ helm delete catalogkubedbcom-memcachedversion-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `catalogkubedbcom-memcachedversion-editor` chart and their default values.

|   Parameter   | Description |            Default            |
|---------------|-------------|-------------------------------|
| apiVersion    |             | `catalog.kubedb.com/v1alpha1` |
| kind          |             | `MemcachedVersion`            |
| metadata.name |             | `memcachedversion`            |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install catalogkubedbcom-memcachedversion-editor bytebuilders-ui/catalogkubedbcom-memcachedversion-editor -n default --set apiVersion=catalog.kubedb.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install catalogkubedbcom-memcachedversion-editor bytebuilders-ui/catalogkubedbcom-memcachedversion-editor -n default --values values.yaml
```
