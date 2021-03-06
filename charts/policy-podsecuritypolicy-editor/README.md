# PodSecurityPolicy Editor

[PodSecurityPolicy Editor by AppsCode](https://byte.builders) - PodSecurityPolicy Editor

## TL;DR;

```console
$ helm repo add bytebuilders-ui https://bundles.bytebuilders.dev/ui/
$ helm repo update
$ helm install policy-podsecuritypolicy-editor bytebuilders-ui/policy-podsecuritypolicy-editor -n default
```

## Introduction

This chart deploys a PodSecurityPolicy Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install the chart with the release name `policy-podsecuritypolicy-editor`:

```console
$ helm install policy-podsecuritypolicy-editor bytebuilders-ui/policy-podsecuritypolicy-editor -n default
```

The command deploys a PodSecurityPolicy Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `policy-podsecuritypolicy-editor`:

```console
$ helm delete policy-podsecuritypolicy-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `policy-podsecuritypolicy-editor` chart and their default values.

|   Parameter   | Description |       Default       |
|---------------|-------------|---------------------|
| apiVersion    |             | `policy/v1beta1`    |
| kind          |             | `PodSecurityPolicy` |
| metadata.name |             | `podsecuritypolicy` |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```console
$ helm install policy-podsecuritypolicy-editor bytebuilders-ui/policy-podsecuritypolicy-editor -n default --set apiVersion=policy/v1beta1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```console
$ helm install policy-podsecuritypolicy-editor bytebuilders-ui/policy-podsecuritypolicy-editor -n default --values values.yaml
```
