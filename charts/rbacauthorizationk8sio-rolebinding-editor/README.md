# RoleBinding Editor

[RoleBinding Editor by AppsCode](https://byte.builders) - RoleBinding Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install rbacauthorizationk8sio-rolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-rolebinding-editor -n default
```

## Introduction

This chart deploys a RoleBinding Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `rbacauthorizationk8sio-rolebinding-editor`:

```console
$ helm install rbacauthorizationk8sio-rolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-rolebinding-editor -n default
```

The command deploys a RoleBinding Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `rbacauthorizationk8sio-rolebinding-editor`:

```console
$ helm delete rbacauthorizationk8sio-rolebinding-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `rbacauthorizationk8sio-rolebinding-editor` chart and their default values.

|     Parameter      | Description |            Default             |
|--------------------|-------------|--------------------------------|
| apiVersion         |             | `rbac.authorization.k8s.io/v1` |
| kind               |             | `RoleBinding`                  |
| metadata.name      |             | `rolebinding`                  |
| metadata.namespace |             | `default`                      |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install rbacauthorizationk8sio-rolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-rolebinding-editor -n default --set apiVersion=rbac.authorization.k8s.io/v1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install rbacauthorizationk8sio-rolebinding-editor bytebuilders-ui/rbacauthorizationk8sio-rolebinding-editor -n default --values values.yaml
```
