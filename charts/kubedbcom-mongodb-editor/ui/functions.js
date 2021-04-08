const operatorList = ["In", "NotIn", "Exists", "DoesNotExist", "Gt", "Lt"];

function disableLableChecker({ itemCtx }) {
  const { key } = itemCtx;
  if (key.startsWith("app.kubernetes.io") || key.includes("helm")) return true;
  else return false;
}

function isEqualToModelPathValue(
  { model, getValue, watchDependency },
  value,
  modelPath
) {
  const modelPathValue = getValue(model, modelPath);
  watchDependency("model#" + modelPath);
  return modelPathValue === value;
}

function showAuthPasswordField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources");
  const modelPathValue = getValue(model, "/resources");
  return !!(
    modelPathValue &&
    modelPathValue.secret &&
    modelPathValue.secret.metadata &&
    modelPathValue.secret.metadata.name &&
    !this.showAuthSecretField({ model, getValue, watchDependency })
  );
}

function showAuthSecretField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources/kubedbComMongoDB/spec");
  const modelPathValue = getValue(model, "/resources/kubedbComMongoDB/spec");
  return !!(
    modelPathValue &&
    modelPathValue.authSecret &&
    modelPathValue.authSecret.name
  );
}

function showNewSecretCreateField({
  model,
  getValue,
  watchDependency,
  commit,
}) {
  const resp =
    !this.showAuthSecretField({ model, getValue, watchDependency }) &&
    !this.showAuthPasswordField({ model, getValue, watchDependency });
  const secret = getValue(model, "/resources/secret_auth");
  if (resp && !secret) {
    commit("wizard/model$update", {
      path: "/resources/secret_auth",
      value: {
        data: {
          password: "",
        },
      },
      force: true,
    });
  }
  return resp;
}

function showCommonStorageClassAndSizeField({
  discriminator,
  getValue,
  watchDependency,
}) {
  watchDependency("discriminator#/activeDatabaseMode");
  const mode = getValue(discriminator, "/activeDatabaseMode");
  const validType = ["Standalone", "Replicaset"];
  return validType.includes(mode);
}

function setApiGroup() {
  return "cert-manager.io";
}

async function getIssuerRefsName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  watchDependency(
    "model#/resources/kubedbComMongoDB/spec/tls/issuerRef/apiGroup"
  );
  watchDependency("model#/resources/kubedbComMongoDB/spec/tls/issuerRef/kind");
  watchDependency("model#/metadata/release/namespace");
  const apiGroup = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/tls/issuerRef/apiGroup"
  );
  const kind = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/tls/issuerRef/kind"
  );
  const namespace = getValue(model, "/metadata/release/namespace");

  let url;
  if (kind === "Issuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/namespaces/${namespace}/issuers`;
  } else if (kind === "ClusterIssuer") {
    url = `/clusters/${owner}/${cluster}/proxy/${apiGroup}/v1/clusterissuers`;
  }

  try {
    const resp = await axios.get(url);

    const resources = (resp && resp.data && resp.data.items) || [];

    resources.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      item.text = name;
      item.value = name;
      return true;
    });
    return resources;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function hasIssuerRefName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const resp = await this.getIssuerRefsName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  return !!(resp && resp.length);
}

async function hasNoIssuerRefName({
  axios,
  storeGet,
  getValue,
  model,
  watchDependency,
}) {
  const resp = await this.hasIssuerRefName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  return !resp;
}

async function getResources(
  { axios, storeGet },
  group,
  version,
  resource
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`,
      {
        params: { filter: { items: { metadata: { name: null } } } },
      }
    );

    const resources = (resp && resp.data && resp.data.items) || [];

    resources.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      item.text = name;
      item.value = name;
      return true;
    });
    return resources;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function getMongoDbVersions(
  { axios, storeGet },
  group,
  version,
  resource
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const queryParams = {
    filter: {
      items: {
        metadata: { name: null },
        spec: { version: null, deprecated: null },
      },
    },
  };

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`,
      {
        params: queryParams,
      }
    );

    const resources = (resp && resp.data && resp.data.items) || [];

    // keep only non deprecated versions
    const filteredMongoDbVersions = resources.filter(
      (item) => item.spec && !item.spec.deprecated
    );

    filteredMongoDbVersions.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      const specVersion = (item.spec && item.spec.version) || "";
      item.text = `${name} (${specVersion})`;
      item.value = name;
      return true;
    });
    return filteredMongoDbVersions;
  } catch (e) {
    console.log(e);
    return [];
  }
}

function configPodTemplateSteps({ commit }, showWithSubStep) {
  commit("wizard/showSteps$update", {
    stepId: "pod-template",
    show: false,
  });
  commit("wizard/showSteps$update", {
    stepId: "pod-template-sharded-topology",
    show: false,
  });

  if (showWithSubStep) {
    commit("wizard/showSteps$update", {
      stepId: "pod-template-sharded-topology",
      show: true,
    });
  } else {
    commit("wizard/showSteps$update", {
      stepId: "pod-template",
      show: true,
    });
  }
}

function setDatabaseMode({ model, getValue, watchDependency, commit }) {
  const modelPathValue = getValue(model, "/resources/kubedbComMongoDB/spec");

  watchDependency("model#/resources/kubedbComMongoDB/spec");
  if (modelPathValue.shardTopology) {
    this.configPodTemplateSteps({ commit }, true);
    return "Sharded";
  } else if (modelPathValue.replicaSet) {
    this.configPodTemplateSteps({ commit }, false);
    return "Replicaset";
  } else {
    this.configPodTemplateSteps({ commit }, false);
    return "Standalone";
  }
}

function setStorageClass({ getValue, commit, model }) {
  const storageClassName = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/shardTopology/shard/storage/storageClassName"
  );
  commit("wizard/model$update", {
    path:
      "/resources/kubedbComMongoDB/spec/shardTopology/configServer/storage/storageClassName",
    value: storageClassName,
    force: true,
  });
}

function deleteDatabaseModePath({
  discriminator,
  getValue,
  commit,
  model,
}) {
  const mode = getValue(discriminator, "/activeDatabaseMode");
  const modelSpec = getValue(model, "/resources/kubedbComMongoDB/spec");
  if (mode === "Sharded") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/replicaSet"
    );
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/replicas");
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/storage");
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/podTemplate"
    );
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/configSecret"
    );

    this.configPodTemplateSteps({ commit }, true);

    if (!modelSpec.shardTopology) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/shardTopology",
        value: {
          configServer: {
            replicas: 3,
            storage: {
              resources: {
                requests: {
                  storage: "",
                },
              },
            },
          },
          mongos: {
            replicas: 2,
          },
          shard: {
            replicas: 3,
            shards: 3,
            storage: {
              resources: {
                requests: {
                  storage: "",
                },
              },
            },
          },
        },
        force: true,
      });
    }
  } else if (mode === "Replicaset") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology"
    );

    this.configPodTemplateSteps({ commit }, false);

    if (!modelSpec.replicaSet) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/replicaSet",
        value: { name: "" },
        force: true,
      });
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/replicas",
        value: 3,
        force: true,
      });
    }
  } else if (mode === "Standalone") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology"
    );

    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/replicaSet"
    );
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/replicas");

    this.configPodTemplateSteps({ commit }, false);
  }
}

function showTlsConfigureSection({
  watchDependency,
  discriminator,
  getValue,
}) {
  watchDependency("discriminator#/configureTLS");
  const configureStatus = getValue(discriminator, "/configureTLS");
  return configureStatus;
}

function onTlsConfigureChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/configureTLS");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/tls",
      value: { issuerRef: {}, certificates: [] },
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/tls");
  }
}

function showMonitoringSection({
  watchDependency,
  discriminator,
  getValue,
}) {
  watchDependency("discriminator#/enableMonitoring");
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  return configureStatus;
}

function onEnableMonitoringChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/enableMonitoring");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/monitor",
      value: {},
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComMongoDB/spec/monitor");
  }
}

function showCustomizeExporterSection({
  watchDependency,
  discriminator,
  getValue,
}) {
  watchDependency("discriminator#/customizeExporter");
  const configureStatus = getValue(discriminator, "/customizeExporter");
  return configureStatus;
}

function onCustomizeExporterChange({ discriminator, getValue, commit }) {
  const configureStatus = getValue(discriminator, "/customizeExporter");
  if (configureStatus) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/monitor/prometheus/exporter",
      value: {},
      force: true,
    });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/monitor/prometheus/exporter"
    );
  }
}

function isEqualToDatabaseMode(
  { getValue, watchDependency, discriminator },
  value
) {
  watchDependency("discriminator#/activeDatabaseMode");
  const mode = getValue(discriminator, "/activeDatabaseMode");
  return mode === value;
}

/****** Monitoring *********/

function getValueFrom({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return "ConfigMap";
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return "Secret";
  } else {
    return "Input";
  }
}

function getRefName({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return itemCtx.valueFrom.configMapKeyRef.name;
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return itemCtx.valueFrom.secretKeyRef.name;
  } else {
    return "";
  }
}

function getKeyOrValue({ itemCtx }) {
  if (itemCtx.valueFrom && itemCtx.valueFrom.configMapKeyRef) {
    return itemCtx.valueFrom.configMapKeyRef.key;
  } else if (itemCtx.valueFrom && itemCtx.valueFrom.secretKeyRef) {
    return itemCtx.valueFrom.secretKeyRef.key;
  } else {
    return itemCtx.value;
  }
}

function setValueFrom({ rootModel }) {
  if (isConfigMapTypeValueFrom({ rootModel })) {
    return "configMap";
  } else if (isSecretTypeValueFrom({ rootModel })) {
    return "secret";
  } else {
    return "input";
  }
}

function isEqualToValueFromType(
  { discriminator, getValue, watchDependency },
  value
) {
  watchDependency("discriminator#/valueFromType");
  const valueFrom = getValue(discriminator, "/valueFromType");
  return valueFrom === value;
}

function isConfigMapTypeValueFrom({ rootModel }) {
  const valueFrom = rootModel.valueFrom;
  return !!(valueFrom && valueFrom.configMapKeyRef);
}

function isSecretTypeValueFrom({ rootModel }) {
  const valueFrom = rootModel.valueFrom;
  return !!(valueFrom && valueFrom.secretKeyRef);
}

function isInputTypeValueFrom({ rootModel }) {
  return (
    !this.isConfigMapTypeValueFrom({ rootModel }) &&
    !this.isSecretTypeValueFrom({ rootModel })
  );
}

function onValueFromChange({
  rootModel,
  discriminator,
  getValue,
  updateModelValue,
}) {
  const valueFrom = getValue(discriminator, "/valueFromType");
  if (valueFrom === "input") {
    if (isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", true);
    if (isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", true);
  } else if (valueFrom === "secret") {
    if (!isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", false, {});
    if (isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", true);
  } else if (valueFrom === "configMap") {
    if (!isConfigMapTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/configMapKeyRef", false, {});
    if (isSecretTypeValueFrom({ rootModel }))
      updateModelValue("valueFrom/secretKeyRef", true);
  }
}

async function showConfigMapSelectField({
  storeGet,
  model,
  getValue,
  watchDependency,
  axios,
}) {
  const resp = await resourceNames(
    { axios, getValue, model, watchDependency, storeGet },
    "core",
    "v1",
    "configmaps"
  );
  return !!(resp && resp.length);
}

async function showConfigMapInputField({
  storeGet,
  model,
  getValue,
  watchDependency,
  axios,
}) {
  const resp = await this.showConfigMapSelectField({
    storeGet,
    model,
    getValue,
    watchDependency,
    axios,
  });
  return !resp;
}

async function showSecretSelectField({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.getSecrets({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !!(resp && resp.length);
}

async function showSecretInputField({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.showSecretSelectField({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !resp;
}

async function getSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  const secretName =
    (rootModel &&
      rootModel.valueFrom &&
      rootModel.valueFrom.secretKeyRef &&
      rootModel.valueFrom.secretKeyRef.name) ||
    "";
  watchDependency("model#/metadata/release/namespace");
  watchDependency("rootModel#/valueFrom/secretKeyRef/name");

  if (!secretName) return [];

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets/${secretName}`
    );

    const secret = (resp && resp.data && resp.data.data) || {};

    const secretKeys = Object.keys(secret).map((item) => ({
      text: item,
      value: item,
    }));

    return secretKeys;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function hasSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.getSecretKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !!(resp && resp.length);
}

async function hasNoSecretKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.hasSecretKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !resp;
}

async function getConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  const configMapName =
    (rootModel &&
      rootModel.valueFrom &&
      rootModel.valueFrom.configMapKeyRef &&
      rootModel.valueFrom.configMapKeyRef.name) ||
    "";
  watchDependency("model#/metadata/release/namespace");
  watchDependency("rootModel#/valueFrom/configMapKeyRef/name");

  if (!configMapName) return [];

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/configmaps/${configMapName}`
    );

    const configMaps = (resp && resp.data && resp.data.data) || {};

    const configMapKeys = Object.keys(configMaps).map((item) => ({
      text: item,
      value: item,
    }));

    return configMapKeys;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function hasConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.getConfigMapKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !!(resp && resp.length);
}

async function hasNoConfigMapKeys({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
  rootModel,
}) {
  const resp = await this.hasConfigMapKeys({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
    rootModel,
  });
  return !resp;
}

function setValueFromModel({ getValue, model }, path) {
  return getValue(model, path);
}

function isEqualToDiscriminatorPath(
  { discriminator, getValue, watchDependency },
  value,
  discriminatorPath
) {
  watchDependency("discriminator#" + discriminatorPath);
  const discriminatorValue = getValue(discriminator, discriminatorPath);
  return discriminatorValue === value;
}

function setHonorLabels({ rootModel }) {
  return rootModel.honorLabels || false;
}

function onConfigSecretNameChange({ commit, model, getValue }) {
  commit("wizard/model$update", {
    path: "resources/kubedbComMongoDB/spec/configSecret/name",
    value: getValue(model, "resources/secret_config/metadata/name"),
    force: true,
  });
}

//////////////////////////////////////////////////////////////////////////

const stashAppscodeComRestoreSession_init = {
  spec: {
    repository: {
      name: "mongodb-init-repo",
    },
    rules: [
      {
        snapshots: ["latest"],
      },
    ],
    target: {
      ref: {
        apiVersion: "appcatalog.appscode.com/v1alpha1",
        kind: "AppBinding",
        name: "mongodb",
      },
    },
    task: {
      name: "mongodb-restore-4.2.3-v5",
    },
  },
};
const initScript = {
  scriptPath: "",
  secret: {
    secretName: "",
  },
};
const stashAppscodeComRepository_init_repo = {
  spec: {
    backend: {
      gcs: {
        bucket: "stash-testing",
        prefix: "/demo/mongodb",
      },
      storageSecretName: "",
    },
  },
};
const stashAppscodeComRepository_repo = {
  spec: {
    backend: {
      gcs: {
        bucket: "stash-testing",
        prefix: "/demo/mongodb",
      },
      storageSecretName: "",
    },
  },
};
const restoreSessionInitRunTimeSettings = {
  container: {
    resources: {
      requests: {
        cpu: "",
        memory: "",
      },
      limits: {
        cpu: "",
        memory: "",
      },
    },
    nice: {
      adjustment: null,
    },
    ionice: {
      class: null,
      classData: null,
    },
    securityContext: {
      privileged: false,
      runAsNonRoot: false,
      runAsUser: null,
      runAsGroup: null,
      seLinuxOptions: {
        level: "",
        role: "",
        type: "",
        user: "",
      },
    },
    env: [],
    envFrom: [],
  },
  pod: {
    serviceAccountName: "",
    imagePullSecrets: [],
    securityContext: {
      fsGroup: null,
      runAsNonRoot: false,
      runAsUser: null,
      runAsGroup: null,
      seLinuxOptions: {
        level: "",
        role: "",
        type: "",
        user: "",
      },
    },
  },
};
const repoBackendMap = {
  azure: { container: "", prefix: "", maxConnections: 1 },
  b2: { bucket: "", prefix: "", maxConnections: 1 },
  gcs: { bucket: "", prefix: "", maxConnections: 1 },
  local: { hostPath: { path: "", mountPath: "", subPath: "" } },
  rest: { url: "" },
  s3: { endpoint: "", bucket: "", prefix: "", region: "" },
  swift: { container: "", prefix: "" },
};
const volumeSourceMap = {
  hostPath: { path: "", mountPath: "", subPath: "" },
  nfs: { path: "", server: "", mountPath: "", subPath: "" },
  persistentVolumeClaim: { claimName: "", mountPath: "", subPath: "" },
};
const stashAppscodeComBackupConfiguration = {
  spec: {
    repository: {
      name: "",
    },
    retentionPolicy: {
      keepLast: 3,
      name: "",
      prune: true,
    },
    schedule: "*/5 * * * *",
    target: {
      ref: {
        apiVersion: "appcatalog.appscode.com/v1alpha1",
        kind: "AppBinding",
        name: "",
      },
    },
    task: {
      name: "",
    },
  },
};

function valueExists(value, getValue, path) {
  const val = getValue(value, path);
  if (val) return true;
  else return false;
}

async function getNamespacedResourceList(
  axios,
  storeGet,
  { namespace, group, version, resource }
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const url = `/clusters/${owner}/${cluster}/proxy/${group}/${version}/namespaces/${namespace}/${resource}`;

  let ans = [];
  try {
    const resp = await axios.get(url, {
      params: {
        filter: { items: { metadata: { name: null }, type: null } },
      },
    });

    const items = (resp && resp.data && resp.data.items) || [];
    ans = items;
  } catch (e) {
    console.log(e);
  }

  return ans;
}

async function getResourceList(
  axios,
  storeGet,
  { group, version, resource }
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");

  const url = `/clusters/${owner}/${cluster}/proxy/${group}/${version}/${resource}`;

  let ans = [];
  try {
    const resp = await axios.get(url, {
      params: {
        filter: { items: { metadata: { name: null }, type: null } },
      },
    });

    const items = (resp && resp.data && resp.data.items) || [];
    ans = items;
  } catch (e) {
    console.log(e);
  }

  return ans;
}

async function resourceNames(
  { axios, getValue, model, watchDependency, storeGet },
  group,
  version,
  resource
) {
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  let resources = await getNamespacedResourceList(axios, storeGet, {
    namespace,
    group,
    version,
    resource,
  });

  if (resource === "secrets") {
    resources = resources.filter((item) => {
      const validType = ["kubernetes.io/service-account-token", "Opaque"];
      return validType.includes(item.type);
    });
  }

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: name,
    };
  });
}

async function unNamespacedResourceNames(
  { axios, storeGet },
  group,
  version,
  resource
) {
  let resources = await getResourceList(axios, storeGet, {
    group,
    version,
    resource,
  });

  if (resource === "secrets") {
    resources = resources.filter((item) => {
      const validType = ["kubernetes.io/service-account-token", "Opaque"];
      return validType.includes(item.type);
    });
  }

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: name,
    };
  });
}

function initPrePopulateDatabase({ getValue, model }) {
  const waitForInitialRestore = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/waitForInitialRestore"
  );
  const stashAppscodeComRestoreSession_init = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init"
  );
  const script = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script"
  );

  return waitForInitialRestore ||
    !!stashAppscodeComRestoreSession_init ||
    !!script
    ? "yes"
    : "no";
}

function onPrePopulateDatabaseChange({
  commit,
  getValue,
  discriminator,
  model,
}) {
  const prePopulateDatabase = getValue(discriminator, "/prePopulateDatabase");
  if (prePopulateDatabase === "no") {
    // delete related properties
    commit("wizard/model$update", {
      path: "/resources/kubedbComMongoDB/spec/init/waitForInitialRestore",
      value: false,
    });
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSession_init"
    );
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script"
    );
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRepository_init_repo"
    );
  } else {
    // set stashAppscodeComRestoreSession_init if it doesn't exist
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSession_init"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSession_init",
        value: stashAppscodeComRestoreSession_init,
      });
  }
}

function initDataSource({ getValue, model }) {
  const script = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script"
  );
  const stashAppscodeComRestoreSession_init = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init"
  );

  if (script) return "script";
  else if (stashAppscodeComRestoreSession_init) return "stashBackup";
  else return undefined;
}

function onDataSourceChange({ commit, getValue, discriminator, model }) {
  const dataSource = getValue(discriminator, "/dataSource");

  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/spec/init/waitForInitialRestore",
    value: dataSource === "stashBackup",
    force: true,
  });

  if (dataSource === "script") {
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSession_init"
    );

    // create a new script if there is no script property
    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script",
        value: initScript,
      });
  } else if (dataSource === "stashBackup") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script"
    );

    // create a new stashAppscodeComRestoreSession_init if there is no stashAppscodeComRestoreSession_init property
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSession_init"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSession_init",
        value: stashAppscodeComRestoreSession_init,
      });
  }
}

// // for script
function initVolumeType({ getValue, model }) {
  const configMap = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script/configMap/name"
  );
  const secret = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/init/script/secret/secretName"
  );

  if (configMap) return "configMap";
  else if (secret) return "secret";
  else return undefined;
}

function onVolumeTypeChange({ commit, getValue, discriminator, model }) {
  const sourceVolumeType = getValue(discriminator, "/sourceVolumeType");
  if (sourceVolumeType === "configMap") {
    // add configMap object and delete secret object
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script/secret"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script/configMap"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script/configMap",
        value: {
          name: "",
        },
      });
    }
  } else if (sourceVolumeType === "secret") {
    // delete configMap object and add secret object
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/init/script/configMap"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComMongoDB/spec/init/script/secret"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/init/script/secret",
        value: {
          secretName: "",
        },
      });
    }
  }
}

function showInitializationForm({
  getValue,
  discriminator,
  watchDependency,
}) {
  const prePopulateDatabase = getValue(discriminator, "/prePopulateDatabase");
  watchDependency("discriminator#/prePopulateDatabase");
  return prePopulateDatabase === "yes";
}

function showScriptOrStashForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const dataSource = getValue(discriminator, "/dataSource");
  watchDependency("discriminator#/dataSource");
  return dataSource === value;
}

function showConfigMapOrSecretName(
  { getValue, discriminator, watchDependency },
  value
) {
  const sourceVolumeType = getValue(discriminator, "/sourceVolumeType");
  watchDependency("discriminator#/sourceVolumeType");
  return sourceVolumeType === value;
}

// for stash backup
function initializeNamespace({ getValue, model }) {
  const namespace = getValue(model, "/metadata/release/namespace");
  return namespace;
}

function showRepositorySelectOrCreate(
  { getValue, discriminator, watchDependency },
  value
) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  watchDependency("discriminator#/repositoryChoise");

  return repositoryChoise === value;
}

function onInitRepositoryChoiseChange({
  getValue,
  discriminator,
  commit,
}) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  if (repositoryChoise === "select") {
    // delete stashAppscodeComRepository_init_repo from model
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRepository_init_repo"
    );
  } else if (repositoryChoise === "create") {
    // add stashAppscodeComRepository_init_repo to model
    commit("wizard/model$update", {
      path: "resources/stashAppscodeComRepository_init_repo",
      value: stashAppscodeComRepository_init_repo,
    });
  }
}

function onInitRepositoryNameChange({ getValue, model, commit }) {
  const repositoryName = getValue(
    model,
    "resources/stashAppscodeComRepository_init_repo/metadata/name"
  );
  // set this name in stashAppscodeComRestoreSession_init
  commit("wizard/model$update", {
    path: "/resources/stashAppscodeComRestoreSession_init/spec/repository/name",
    value: repositoryName,
  });
}

// // Repository Backend
function initBackendType({ getValue, model }, prefix) {
  return Object.keys(repoBackendMap).find((key) => {
    const value = getValue(model, `${prefix}/spec/backend/${key}`);

    return value ? true : false;
  });
}

function onBackendTypeChange(
  { commit, getValue, discriminator, model },
  prefix
) {
  const selectedBackendType = getValue(discriminator, "/backendType");

  // delete every other backend type from model  exect the selected one
  Object.keys(repoBackendMap).forEach((key) => {
    if (key !== selectedBackendType) {
      commit("wizard/model$delete", `${prefix}/spec/backend/${key}`);
    }
  });

  // set the selectedBackend type object in
  if (
    !valueExists(
      model,
      getValue,
      `${prefix}/spec/backend/${selectedBackendType}`
    )
  ) {
    commit("wizard/model$update", {
      path: `${prefix}/spec/backend/${selectedBackendType}`,
      value: repoBackendMap[selectedBackendType],
    });
  }
}

function showBackendForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const backendType = getValue(discriminator, "/backendType");
  watchDependency("discriminator#/backendType");
  return backendType === value;
}

function initVolumeSource({ getValue, model }, prefix) {
  return Object.keys(volumeSourceMap).find((key) => {
    const value = getValue(model, `${prefix}/spec/backend/local/${key}`);

    return value ? true : false;
  });
}

function onVolumeSourceChange(
  { commit, getValue, discriminator, model },
  prefix
) {
  const selectedVolumeSource = getValue(discriminator, "/volumeSource");

  // delete every other volume source type from model except selected one
  Object.keys(volumeSourceMap).forEach((key) => {
    if (key !== selectedVolumeSource) {
      commit("wizard/model$delete", `${prefix}/spec/backend/local/${key}`);
    }
  });

  // set the selectedVolumeSource object in model
  if (
    !valueExists(
      model,
      getValue,
      `${prefix}/spec/backend/local/${selectedVolumeSource}`
    )
  ) {
    commit("wizard/model$update", {
      path: `${prefix}/spec/backend/local/${selectedVolumeSource}`,
      value: volumeSourceMap[selectedVolumeSource],
    });
  }
}

function showVolumeSourceForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const volumeSource = getValue(discriminator, "/volumeSource");
  watchDependency("discriminator#/volumeSource");
  return volumeSource === value;
}

function initCustomizeRestoreJobRuntimeSettings({ getValue, model }) {
  const runtimeSettings = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init/spec/runtimeSettings"
  );
  if (runtimeSettings) return "yes";
  else return "no";
}

function onCustomizeRestoreJobRuntimeSettingsChange({
  commit,
  getValue,
  discriminator,
  model,
}) {
  const customizeRestoreJobRuntimeSettings = getValue(
    discriminator,
    "/customizeRestoreJobRuntimeSettings"
  );
  if (customizeRestoreJobRuntimeSettings === "no") {
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSession_init/spec/runtimeSettings"
    );
  } else if (customizeRestoreJobRuntimeSettings === "yes") {
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSession_init/spec/runtimeSettings"
      )
    ) {
      // set new value
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComRestoreSession_init/spec/runtimeSettings",
        value: restoreSessionInitRunTimeSettings,
      });
    }
  }
}

function showRuntimeForm(
  { discriminator, getValue, watchDependency },
  value
) {
  const customizeRestoreJobRuntimeSettings = getValue(
    discriminator,
    "/customizeRestoreJobRuntimeSettings"
  );
  watchDependency("discriminator#/customizeRestoreJobRuntimeSettings");
  return customizeRestoreJobRuntimeSettings === value;
}

async function getImagePullSecrets({
  getValue,
  model,
  watchDependency,
  axios,
  storeGet,
}) {
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  let resources = await getNamespacedResourceList(axios, storeGet, {
    namespace,
    group: "core",
    version: "v1",
    resource: "secrets",
  });

  resources = resources.filter((item) => {
    const validType = ["kubernetes.io/dockerconfigjson"];
    return validType.includes(item.type);
  });

  return resources.map((resource) => {
    const name = (resource.metadata && resource.metadata.name) || "";
    return {
      text: name,
      value: { name: name },
    };
  });
}

// for environment variable (stash initialization)
// same as monitoring step

// // for envFrom
function showRefType({ itemCtx }) {
  if (itemCtx.configMapRef) return "ConfigMap";
  else if (itemCtx.secretRef) return "Secret";
  else return "-";
}

function showRefName({ itemCtx }) {
  if (itemCtx.configMapRef) {
    return itemCtx.configMapRef.name;
  } else if (itemCtx.secretRef) {
    return itemCtx.secretRef.name;
  } else {
    return "";
  }
}

function initializeRefType({ rootModel }) {
  if (rootModel.configMapRef) return "configMap";
  else if (rootModel.secretRef) return "secret";
  else return undefined;
}

function onRefTypeChange({
  rootModel,
  getValue,
  discriminator,
  updateModelValue,
}) {
  const refType = getValue(discriminator, "/refType");
  if (refType === "configMap") {
    // delete secretRef
    if (valueExists(rootModel, getValue, "/secretRef"))
      updateModelValue("/secretRef", true);
    // add configMapRef
    if (!valueExists(rootModel, getValue, "/configMapRef"))
      updateModelValue("/configMapRef", false, { name: "" });
  } else {
    // delete configMapRef
    if (valueExists(rootModel, getValue, "/configMapRef"))
      updateModelValue("/configMapRef", true);
    // add secretRef
    if (!valueExists(rootModel, getValue, "/secretRef"))
      updateModelValue("/secretRef", false, { name: "" });
  }
}

function showRefSelect(
  { discriminator, getValue, watchDependency },
  value
) {
  const refType = getValue(discriminator, "/refType");
  watchDependency("discriminator#/refType");
  return refType === value;
}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR Backup Configuration

// schedule bakcup

function getBackupConfigsAndAnnotations(getValue, model) {
  const stashAppscodeComBackupConfiguration = getValue(
    model,
    "/resources/stashAppscodeComBackupConfiguration"
  );
  const kubedbComMongoDBAnnotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};

  const isBluePrint = Object.keys(kubedbComMongoDBAnnotations).some(
    (k) =>
      k === "stash.appscode.com/backup-blueprint" ||
      k === "stash.appscode.com/schedule" ||
      k.startsWith("params.stash.appscode.com/")
  );

  return {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  };
}

function deleteKubeDbComMongDbAnnotation(getValue, model, commit) {
  const annotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};
  const filteredKeyList =
    Object.keys(annotations).filter(
      (k) =>
        k !== "stash.appscode.com/backup-blueprint" &&
        k !== "stash.appscode.com/schedule" &&
        !k.startsWith("params.stash.appscode.com/")
    ) || [];
  const filteredAnnotations = {};
  filteredKeyList.forEach((k) => {
    filteredAnnotations[k] = annotations[k];
  });
  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: filteredAnnotations,
  });
}

function addKubeDbComMongDbAnnotation(
  getValue,
  model,
  commit,
  key,
  value,
  force
) {
  const annotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};

  if (annotations[key] === undefined) {
    annotations[key] = value;
  } else if (force) {
    annotations[key] = value;
  }

  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: annotations,
    force: true,
  });
}

function initScheduleBackup({ getValue, model }) {
  const {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  } = getBackupConfigsAndAnnotations(getValue, model);

  if (stashAppscodeComBackupConfiguration || isBluePrint) return "yes";
  else return "no";
}

function onScheduleBackupChange({
  commit,
  getValue,
  discriminator,
  model,
}) {
  const scheduleBackup = getValue(discriminator, "/scheduleBackup");

  if (scheduleBackup === "no") {
    // delete stashAppscodeComBackupConfiguration
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComBackupConfiguration"
    );
    commit("wizard/model$delete", "/resources/stashAppscodeComRepository_repo");
    // delete annotation from KubeDBComMongoDB annotation
    deleteKubeDbComMongDbAnnotation(getValue, model, commit);
  } else {
    const { isBluePrint } = getBackupConfigsAndAnnotations(getValue, model);

    // create stashAppscodeComBackupConfiguration and initialize it if not exists

    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComBackupConfiguration"
      ) &&
      !isBluePrint
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComBackupConfiguration",
        value: stashAppscodeComBackupConfiguration,
      });
    }
  }
}

// backup form
function showBackupForm({ getValue, discriminator, watchDependency }) {
  const scheduleBackup = getValue(discriminator, "/scheduleBackup");
  watchDependency("discriminator#/scheduleBackup");

  if (scheduleBackup === "yes") return true;
  else return false;
}

// invoker form
function initBackupInvoker({ getValue, model }) {
  const {
    stashAppscodeComBackupConfiguration,
    isBluePrint,
  } = getBackupConfigsAndAnnotations(getValue, model);

  if (stashAppscodeComBackupConfiguration) return "backupConfiguration";
  else if (isBluePrint) return "backupBlueprint";
  else return undefined;
}

function onBackupInvokerChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const backupInvoker = getValue(discriminator, "/backupInvoker");

  if (backupInvoker === "backupConfiguration") {
    // delete annotation and create backup config object
    deleteKubeDbComMongDbAnnotation(getValue, model, commit);
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComBackupConfiguration"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComBackupConfiguration",
        value: stashAppscodeComBackupConfiguration,
      });
    }
  } else if (backupInvoker === "backupBlueprint") {
    // delete backup configuration object and create the annotation
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComBackupConfiguration"
    );
    addKubeDbComMongDbAnnotation(
      getValue,
      model,
      commit,
      "stash.appscode.com/backup-blueprint",
      ""
    );
  }
}

function showInvokerForm(
  { getValue, discriminator, watchDependency },
  value
) {
  const backupInvoker = getValue(discriminator, "/backupInvoker");
  watchDependency("discriminator#/backupInvoker");

  return backupInvoker === value;
}

// backup configuration form
function initalizeTargetReferenceName({
  getValue,
  model,
  watchDependency,
}) {
  const databaseName = getValue(model, "/metadata/release/name");
  watchDependency("model#/metadata/release/name");

  return databaseName;
}

// backup config repository
function initRepositoryChoise({ getValue, model }) {
  const stashAppscodeComRepository_repo = getValue(
    model,
    "/resources/stashAppscodeComRepository_repo"
  );

  if (stashAppscodeComRepository_repo) return "create";
  else return "select";
}

function onRepositoryChoiseChange({
  getValue,
  discriminator,
  watchDependency,
  commit,
  model,
}) {
  const repositoryChoise = getValue(discriminator, "/repositoryChoise");
  watchDependency("discriminator#/repositoryChoise");

  if (repositoryChoise === "select") {
    // delete the stashAppscodeComRepository_repo
    commit("wizard/model$delete", "/resources/stashAppscodeComRepository_repo");
  } else if (repositoryChoise === "create") {
    // create new stashAppscodeComRepository_repo
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRepository_repo"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRepository_repo",
        value: stashAppscodeComRepository_repo,
      });
    }
  }
}

function onRepositoryNameChange({ getValue, model, commit }) {
  const repositoryName = getValue(
    model,
    "resources/stashAppscodeComRepository_repo/metadata/name"
  );
  // set this name in stashAppscodeComRestoreSession_init
  commit("wizard/model$update", {
    path: "/resources/stashAppscodeComBackupConfiguration/spec/repository/name",
    value: repositoryName,
  });
}

// backup blueprint form
function getMongoAnnotations(getValue, model) {
  const annotations = getValue(
    model,
    "/resources/kubedbComMongoDB/metadata/annotations"
  );
  return { ...annotations } || {};
}

function initFromAnnotationValue({ getValue, model }, key) {
  const annotations = getMongoAnnotations(getValue, model);
  return annotations[key];
}

function onBackupBlueprintNameChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const backupBlueprintName = getValue(discriminator, "/backupBlueprintName");
  addKubeDbComMongDbAnnotation(
    getValue,
    model,
    commit,
    "stash.appscode.com/backup-blueprint",
    backupBlueprintName,
    true
  );
}

function onBackupBlueprintScheduleChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const backupBlueprintSchedule = getValue(discriminator, "/schedule");
  addKubeDbComMongDbAnnotation(
    getValue,
    model,
    commit,
    "stash.appscode.com/schedule",
    backupBlueprintSchedule,
    true
  );
}

function initFromAnnotationKeyValue({ getValue, model }, prefix) {
  const annotations = getMongoAnnotations(getValue, model);
  const newOb = {};
  Object.keys(annotations).forEach((key) => {
    if (key.startsWith(prefix)) {
      const newKey = key.replace(prefix, "");
      newOb[newKey] = annotations[key];
    }
  });
  return newOb;
}

function onTaskParametersChange({
  getValue,
  discriminator,
  model,
  commit,
}) {
  const taskParameters = getValue(discriminator, "/taskParameters");

  const taskParamterKeys = Object.keys(taskParameters).map(
    (tp) => `params.stash.appscode.com/${tp}`
  );
  const oldAnnotations =
    getValue(model, "/resources/kubedbComMongoDB/metadata/annotations") || {};
  const newAnnotations = {};

  const filteredAnnotationKeys = Object.keys(oldAnnotations).filter(
    (key) =>
      !taskParamterKeys.includes(key) &&
      !key.startsWith("params.stash.appscode.com/")
  );

  filteredAnnotationKeys.forEach((key) => {
    newAnnotations[key] = oldAnnotations[key];
  });

  Object.keys(taskParameters).forEach((tpk) => {
    newAnnotations[`params.stash.appscode.com/${tpk}`] = taskParameters[tpk];
  });

  commit("wizard/model$update", {
    path: "/resources/kubedbComMongoDB/metadata/annotations",
    value: newAnnotations,
  });
}

function isValueExistInModel({ model, getValue }, path) {
  const modelValue = getValue(model, path);
  return !!modelValue;
}

function onNamespaceChange({ commit, model, getValue }) {
  const namespace = getValue(model, "/metadata/release/namespace");
  const agent = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/monitor/agent"
  );
  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path:
        "/resources/monitoringCoreosComServiceMonitor/spec/namespaceSelector/matchNames",
      value: [namespace],
      force: true,
    });
  }
}

function onLabelChange({ commit, model, getValue }) {
  const labels = getValue(model, "/resources/kubedbComMongoDB/metadata/labels");

  const agent = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/monitor/agent"
  );

  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path:
        "/resources/monitoringCoreosComServiceMonitor/spec/selector/matchLabels",
      value: labels,
      force: true,
    });
  }
}

function onNameChange() {}

function returnFalse() {
  return false;
}

function onAgentChange({ commit, model, getValue }) {
  const agent = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/monitor/agent"
  );
  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/endpoints",
      value: [],
      force: true,
    });

    this.onNamespaceChange({ commit, model, getValue });
    this.onLabelChange({ commit, model, getValue });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/monitoringCoreosComServiceMonitor"
    );
  }
}

function getOperatorsList() {
  return operatorList.map((item) => {
    return { text: item, value: item };
  });
}

/*************************************  Database Secret Section ********************************************/

let initialCreateAuthSecretStatus = "";

function getInitialCreateAuthSecretStatus({ model, getValue }) {
  const authSecret = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/authSecret"
  );
  const secret_auth = getValue(model, "/resources/secret_auth");
  if (authSecret) initialCreateAuthSecretStatus = "has-existing-secret";
  else if (secret_auth)
    initialCreateAuthSecretStatus = "custom-secret-with-password";
  else initialCreateAuthSecretStatus = "custom-secret-without-password";
  return initialCreateAuthSecretStatus;
}

function getDatabaseSecretStatus({ model, getValue, watchDependency }) {
  const authSecret = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/authSecret"
  );
  const secret_auth = getValue(model, "/resources/secret_auth");
  watchDependency("model#/resources/kubedbComMongoDB/spec/authSecret");
  watchDependency("model#/resources/secret_auth");
  if (authSecret) return "has-existing-secret";
  else if (secret_auth) return "custom-secret-with-password";
  else return "custom-secret-without-password";
}

function getCreateAuthSecret({ model, getValue }) {
  return (
    this.getInitialCreateAuthSecretStatus({ model, getValue }) !==
    "has-existing-secret"
  );
}

function isEqualToDatabaseSecretStatus(
  { model, getValue, watchDependency },
  value
) {
  return (
    this.getDatabaseSecretStatus({ model, getValue, watchDependency }) === value
  );
}

function showPasswordSection({
  getValue,
  watchDependency,
  discriminator,
}) {
  watchDependency("discriminator#/createAuthSecret");
  const currentCreateAuthSecretStatus = getValue(
    discriminator,
    "/createAuthSecret"
  );
  return (
    initialCreateAuthSecretStatus === "custom-secret-with-password" &&
    currentCreateAuthSecretStatus
  );
}

// eslint-disable-next-line no-empty-pattern
function encodePassword({}, value) {
  return btoa(value);
}

// eslint-disable-next-line no-empty-pattern
function decodePassword({}, value) {
  return atob(value);
}

function onCreateAuthSecretChange({
  discriminator,
  model,
  getValue,
  commit,
}) {
  const createAuthSecret = getValue(discriminator, "/createAuthSecret");
  if (createAuthSecret) {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/authSecret"
    );
  } else {
    const modelValue = getValue(
      model,
      "/resources/kubedbComMongoDB/spec/authSecret"
    );
    if (!modelValue) {
      debugger;
      commit("wizard/model$update", {
        path: "/resources/kubedbComMongoDB/spec/authSecret",
        value: {},
        force: true,
      });
    }
  }
}

async function getSecrets({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/clusterInfo/name");
  const namespace = getValue(model, "/metadata/release/namespace");
  watchDependency("model#/metadata/release/namespace");

  try {
    const resp = await axios.get(
      `/clusters/${owner}/${cluster}/proxy/core/v1/namespaces/${namespace}/secrets`,
      {
        params: {
          filter: { items: { metadata: { name: null }, type: null } },
        },
      }
    );

    const secrets = (resp && resp.data && resp.data.items) || [];

    const filteredSecrets = secrets.filter((item) => {
      const validType = ["kubernetes.io/service-account-token", "Opaque"];
      return validType.includes(item.type);
    });

    filteredSecrets.map((item) => {
      const name = (item.metadata && item.metadata.name) || "";
      item.text = name;
      item.value = name;
      return true;
    });
    return filteredSecrets;
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function hasExistingSecret({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.getSecrets({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !!(resp && resp.length);
}

async function hasNoExistingSecret({
  storeGet,
  axios,
  model,
  getValue,
  watchDependency,
}) {
  const resp = await this.hasExistingSecret({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !resp;
}

//////////////////////////////////////// custom config //////////////////////////////////////////////////////

function setConfigurationSource({ model, getValue }) {
  const modelValue = getValue(model, "/resources/secret_config");
  if (modelValue) {
    return "create-new-config";
  }
  return "use-existing-config";
}

function onConfigurationSourceChange({
  getValue,
  discriminator,
  commit,
}) {
  const configurationSource = getValue(discriminator, "/configurationSource");
  if (configurationSource === "use-existing-config") {
    commit("wizard/model$delete", "/resources/secret_config");
  }
}

function setSecretConfigNamespace({ getValue, model, watchDependency }) {
  watchDependency("model#/metadata/release/namespace");
  const namespace = getValue(model, "/metadata/release/namespace");
  return namespace;
}

//////////////////// service monitor ///////////////////

function isEqualToServiceMonitorType(
  { rootModel, watchDependency },
  value
) {
  watchDependency("rootModel#/spec/type");
  return rootModel && rootModel.spec && rootModel.spec.type === value;
}

/////////////////// topology ////////////////////////
function onCustomizeShardsTemplateChange({
  discriminator,
  getValue,
  commit,
  watchDependency,
}) {
  watchDependency("discriminator#/customizeShardsPodTemplate");
  const value = getValue(discriminator, "/customizeShardsPodTemplate");
  if (value === "no") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology/shard/podTemplate"
    );
  }
}

function onCustomizeConfigServerTemplateChange({
  discriminator,
  getValue,
  commit,
  watchDependency,
}) {
  watchDependency("discriminator#/customizeConfigServerPodTemplate");
  const value = getValue(discriminator, "/customizeConfigServerPodTemplate");
  if (value === "no") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology/configServer/podTemplate"
    );
  }
}

function onCustomizeMongosTemplateChange({
  discriminator,
  getValue,
  commit,
  watchDependency,
}) {
  watchDependency("discriminator#/customizeMongosPodTemplate");
  const value = getValue(discriminator, "/customizeMongosPodTemplate");
  if (value === "no") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/shardTopology/mongos/podTemplate"
    );
  }
}

//////////////////// custom config /////////////////
function showCustomConfig({ model, getValue, watchDependency }) {
  watchDependency("model#/resources/kubedbComMongoDB/spec");
  const hasShardTopology = getValue(
    model,
    "/resources/kubedbComMongoDB/spec/shardTopology"
  );
  return !hasShardTopology;
}

function showEmptyCustomConfig({
  model,
  getValue,
  watchDependency,
  commit,
}) {
  const resp = !this.showCustomConfig({ model, getValue, watchDependency });
  if (resp) {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComMongoDB/spec/configSecret"
    );
    commit("wizard/model$delete", "/resources/secret_config");
  }
  return resp;
}


return {
	disableLableChecker,
	isEqualToModelPathValue,
	showAuthPasswordField,
	showAuthSecretField,
	showNewSecretCreateField,
	showCommonStorageClassAndSizeField,
	setApiGroup,
	getIssuerRefsName,
	hasIssuerRefName,
	hasNoIssuerRefName,
	getResources,
	getMongoDbVersions,
	configPodTemplateSteps,
	setDatabaseMode,
	setStorageClass,
	deleteDatabaseModePath,
	showTlsConfigureSection,
	onTlsConfigureChange,
	showMonitoringSection,
	onEnableMonitoringChange,
	showCustomizeExporterSection,
	onCustomizeExporterChange,
	isEqualToDatabaseMode,
	getValueFrom,
	getRefName,
	getKeyOrValue,
	setValueFrom,
	isEqualToValueFromType,
	isConfigMapTypeValueFrom,
	isSecretTypeValueFrom,
	isInputTypeValueFrom,
	onValueFromChange,
	showConfigMapSelectField,
	showConfigMapInputField,
	showSecretSelectField,
	showSecretInputField,
	getSecretKeys,
	hasSecretKeys,
	hasNoSecretKeys,
	getConfigMapKeys,
	hasConfigMapKeys,
	hasNoConfigMapKeys,
	setValueFromModel,
	isEqualToDiscriminatorPath,
	setHonorLabels,
	onConfigSecretNameChange,
	valueExists,
	getNamespacedResourceList,
	getResourceList,
	resourceNames,
	unNamespacedResourceNames,
	initPrePopulateDatabase,
	onPrePopulateDatabaseChange,
	initDataSource,
	onDataSourceChange,
	initVolumeType,
	onVolumeTypeChange,
	showInitializationForm,
	showScriptOrStashForm,
	showConfigMapOrSecretName,
	initializeNamespace,
	showRepositorySelectOrCreate,
	onInitRepositoryChoiseChange,
	onInitRepositoryNameChange,
	initBackendType,
	onBackendTypeChange,
	showBackendForm,
	initVolumeSource,
	onVolumeSourceChange,
	showVolumeSourceForm,
	initCustomizeRestoreJobRuntimeSettings,
	onCustomizeRestoreJobRuntimeSettingsChange,
	showRuntimeForm,
	getImagePullSecrets,
	showRefType,
	showRefName,
	initializeRefType,
	onRefTypeChange,
	showRefSelect,
	getBackupConfigsAndAnnotations,
	deleteKubeDbComMongDbAnnotation,
	addKubeDbComMongDbAnnotation,
	initScheduleBackup,
	onScheduleBackupChange,
	showBackupForm,
	initBackupInvoker,
	onBackupInvokerChange,
	showInvokerForm,
	initalizeTargetReferenceName,
	initRepositoryChoise,
	onRepositoryChoiseChange,
	onRepositoryNameChange,
	getMongoAnnotations,
	initFromAnnotationValue,
	onBackupBlueprintNameChange,
	onBackupBlueprintScheduleChange,
	initFromAnnotationKeyValue,
	onTaskParametersChange,
	isValueExistInModel,
	onNamespaceChange,
	onLabelChange,
	onNameChange,
	returnFalse,
	onAgentChange,
	getOperatorsList,
	getInitialCreateAuthSecretStatus,
	getDatabaseSecretStatus,
	getCreateAuthSecret,
	isEqualToDatabaseSecretStatus,
	showPasswordSection,
	encodePassword,
	decodePassword,
	onCreateAuthSecretChange,
	getSecrets,
	hasExistingSecret,
	hasNoExistingSecret,
	setConfigurationSource,
	onConfigurationSourceChange,
	setSecretConfigNamespace,
	isEqualToServiceMonitorType,
	onCustomizeShardsTemplateChange,
	onCustomizeConfigServerTemplateChange,
	onCustomizeMongosTemplateChange,
	showCustomConfig,
	showEmptyCustomConfig
}