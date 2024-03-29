# Kafka Editor UI Options

[Kafka Editor UI Options](https://byte.builders) - Kafka Editor UI Options

## TL;DR;

```bash
$ helm repo add bytebuilders-ui https://bundles.byte.builders/ui/
$ helm repo update
$ helm search repo bytebuilders-ui/kubedbcom-kafka-editor-options --version=v0.4.18
$ helm upgrade -i kubedbcom-kafka-editor-options bytebuilders-ui/kubedbcom-kafka-editor-options -n kube-system --create-namespace --version=v0.4.18
```

## Introduction

This chart deploys a Kafka Editor UI Options on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

## Prerequisites

- Kubernetes 1.14+

## Installing the Chart

To install/upgrade the chart with the release name `kubedbcom-kafka-editor-options`:

```bash
$ helm upgrade -i kubedbcom-kafka-editor-options bytebuilders-ui/kubedbcom-kafka-editor-options -n kube-system --create-namespace --version=v0.4.18
```

The command deploys a Kafka Editor UI Options on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `kubedbcom-kafka-editor-options`:

```bash
$ helm uninstall kubedbcom-kafka-editor-options -n kube-system
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the `kubedbcom-kafka-editor-options` chart and their default values.

|                 Parameter                 |                                                                                Description                                                                                |                          Default                          |
|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|
| metadata.resource.group                   |                                                                                                                                                                           | <code>kubedb.com</code>                                   |
| metadata.resource.kind                    |                                                                                                                                                                           | <code>Kafka</code>                                        |
| metadata.resource.name                    |                                                                                                                                                                           | <code>kafkas</code>                                       |
| metadata.resource.scope                   |                                                                                                                                                                           | <code>Namespaced</code>                                   |
| metadata.resource.version                 |                                                                                                                                                                           | <code>v1alpha2</code>                                     |
| metadata.release.name                     | Release name                                                                                                                                                              | <code>""</code>                                           |
| metadata.release.namespace                | Release namespace                                                                                                                                                         | <code>""</code>                                           |
| spec.version                              | List options                                                                                                                                                              | <code>3.6.0</code>                                        |
| spec.annotations                          | Annotations to add to the database custom resource                                                                                                                        | <code>{}</code>                                           |
| spec.labels                               | Labels to add to all the template objects                                                                                                                                 | <code>{}</code>                                           |
| spec.mode                                 | Combined, Dedicated                                                                                                                                                       | <code>Combined</code>                                     |
| spec.replicas                             |                                                                                                                                                                           | <code>3</code>                                            |
| spec.topology.controller.replicas         |                                                                                                                                                                           | <code>3</code>                                            |
| spec.topology.controller.machine          |                                                                                                                                                                           | <code>""</code>                                           |
| spec.topology.controller.persistence.size |                                                                                                                                                                           | <code>1Gi</code>                                          |
| spec.topology.broker.replicas             |                                                                                                                                                                           | <code>3</code>                                            |
| spec.topology.broker.machine              |                                                                                                                                                                           | <code>""</code>                                           |
| spec.topology.broker.persistence.size     |                                                                                                                                                                           | <code>1Gi</code>                                          |
| spec.disableSecurity                      |                                                                                                                                                                           | <code>false</code>                                        |
| spec.terminationPolicy                    |                                                                                                                                                                           | <code>WipeOut</code>                                      |
| spec.storageClass.name                    |                                                                                                                                                                           | <code>standard</code>                                     |
| spec.persistence.size                     |                                                                                                                                                                           | <code>1Gi</code>                                          |
| spec.machine                              |                                                                                                                                                                           | <code>""</code>                                           |
| spec.resources.limits.cpu                 |                                                                                                                                                                           | <code>500m</code>                                         |
| spec.resources.limits.memory              |                                                                                                                                                                           | <code>1Gi</code>                                          |
| spec.authSecret.name                      |                                                                                                                                                                           | <code>""</code>                                           |
| spec.authSecret.password                  |                                                                                                                                                                           | <code>""</code>                                           |
| spec.monitoring.agent                     | Name of monitoring agent (one of "prometheus.io", "prometheus.io/operator", "prometheus.io/builtin")                                                                      | <code>prometheus.io/operator</code>                       |
| spec.monitoring.exporter.resources        |                                                                                                                                                                           | <code>{"requests":{"cpu":"100m","memory":"128Mi"}}</code> |
| spec.monitoring.serviceMonitor.labels     | Specify the labels for ServiceMonitor. Prometheus crd will select ServiceMonitor using these labels. Only usable when monitoring agent is `prometheus.io/webhook server`. | <code>{}</code>                                           |


Specify each parameter using the `--set key=value[,key=value]` argument to `helm upgrade -i`. For example:

```bash
$ helm upgrade -i kubedbcom-kafka-editor-options bytebuilders-ui/kubedbcom-kafka-editor-options -n kube-system --create-namespace --version=v0.4.18 --set metadata.resource.group=kubedb.com
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while
installing the chart. For example:

```bash
$ helm upgrade -i kubedbcom-kafka-editor-options bytebuilders-ui/kubedbcom-kafka-editor-options -n kube-system --create-namespace --version=v0.4.18 --values values.yaml
```
