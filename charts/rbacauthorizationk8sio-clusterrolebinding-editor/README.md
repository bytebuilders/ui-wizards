# ClusterRoleBinding Editor

[ClusterRoleBinding Editor by AppsCode](https://byte.builders) - ClusterRoleBinding Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install rbacauthorizationk8sio-clusterrolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-clusterrolebinding-editor -n default
```

## Introduction

This chart deploys a ClusterRoleBinding Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `rbacauthorizationk8sio-clusterrolebinding-editor`:

```console
$ helm install rbacauthorizationk8sio-clusterrolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-clusterrolebinding-editor -n default
```

The command deploys a ClusterRoleBinding Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `rbacauthorizationk8sio-clusterrolebinding-editor`:

```console
$ helm delete rbacauthorizationk8sio-clusterrolebinding-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `rbacauthorizationk8sio-clusterrolebinding-editor` chart and their default values.

|   Parameter   | Description |            Default             |
|---------------|-------------|--------------------------------|
| apiVersion    |             | `rbac.authorization.k8s.io/v1` |
| kind          |             | `ClusterRoleBinding`           |
| metadata.name |             | `clusterrolebinding`           |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install rbacauthorizationk8sio-clusterrolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-clusterrolebinding-editor -n default --set apiVersion=rbac.authorization.k8s.io/v1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install rbacauthorizationk8sio-clusterrolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-clusterrolebinding-editor -n default --values values.yaml
```
