# FirewallRule Editor

[FirewallRule Editor by AppsCode](https://byte.builders) - FirewallRule Editor

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/dbformysqlazurekubeformcom-firewallrule-editor --version=v0.4.16
$ helm upgrade -i dbformysqlazurekubeformcom-firewallrule-editor bytebuilders-ui/dbformysqlazurekubeformcom-firewallrule-editor -n default --create-namespace --version=v0.4.16
```

## Introduction

This chart deploys a FirewallRule Editor on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.16+

## Installing the Chart

To install/upgrade the chart with the release name `dbformysqlazurekubeformcom-firewallrule-editor`:

```bash
$ helm upgrade -i dbformysqlazurekubeformcom-firewallrule-editor bytebuilders-ui/dbformysqlazurekubeformcom-firewallrule-editor -n default --create-namespace --version=v0.4.16
```

The command deploys a FirewallRule Editor on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `dbformysqlazurekubeformcom-firewallrule-editor`:

```bash
$ helm uninstall dbformysqlazurekubeformcom-firewallrule-editor -n default
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `dbformysqlazurekubeformcom-firewallrule-editor` chart and their default values.

|     Parameter      | Description |                       Default                       |
|--------------------|-------------|-----------------------------------------------------|
| apiVersion         |             | <code>dbformysql.azure.kubeform.com/v1alpha1</code> |
| kind               |             | <code>FirewallRule</code>                           |
| metadata.name      |             | <code>firewallrule</code>                           |
| metadata.namespace |             | <code>""</code>                                     |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i dbformysqlazurekubeformcom-firewallrule-editor bytebuilders-ui/dbformysqlazurekubeformcom-firewallrule-editor -n default --create-namespace --version=v0.4.16 --set apiVersion=dbformysql.azure.kubeform.com/v1alpha1
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i dbformysqlazurekubeformcom-firewallrule-editor bytebuilders-ui/dbformysqlazurekubeformcom-firewallrule-editor -n default --create-namespace --version=v0.4.16 --values values.yaml
```