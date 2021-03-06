# AuditSink Editor

[AuditSink Editor by AppsCode](https://byte.builders) - AuditSink Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install auditregistrationk8sio-auditsink-editor bytebuilders-ui/auditregistrationk8sio-auditsink-editor -n default
```

## Introduction

This chart deploys a AuditSink Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `auditregistrationk8sio-auditsink-editor`:

```console
$ helm install auditregistrationk8sio-auditsink-editor bytebuilders-ui/auditregistrationk8sio-auditsink-editor -n default
```

The command deploys a AuditSink Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `auditregistrationk8sio-auditsink-editor`:

```console
$ helm delete auditregistrationk8sio-auditsink-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `auditregistrationk8sio-auditsink-editor` chart and their default values.

|     Parameter      | Description |               Default               |
|--------------------|-------------|-------------------------------------|
| apiVersion         |             | `auditregistration.k8s.io/v1alpha1` |
| kind               |             | `AuditSink`                         |
| metadata.name      |             | `auditsink`                         |
| metadata.namespace |             | `default`                           |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install auditregistrationk8sio-auditsink-editor bytebuilders-ui/auditregistrationk8sio-auditsink-editor -n default --set apiVersion=auditregistration.k8s.io/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install auditregistrationk8sio-auditsink-editor bytebuilders-ui/auditregistrationk8sio-auditsink-editor -n default --values values.yaml
```
