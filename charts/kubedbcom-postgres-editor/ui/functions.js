// *************************      common functions ********************************************
// eslint-disable-next-line no-empty-pattern
async function fetchJsons({ axios, itemCtx }) {
  let ui = {};
  let language = {};
  let functions = {};
  const { name, url, version } = itemCtx.chart;
  const urlPrefix = "/chart/packageview/files/ui";
  try {
    ui = await axios.get(
      `${urlPrefix}/create-ui.yaml?name=${name}&url=${url}&version=${version}&format=json`
    );
    language = await axios.get(
      `${urlPrefix}/language.yaml?name=${name}&url=${url}&version=${version}&format=json`
    );
    const functionString = await axios.get(
      `${urlPrefix}/functions.js?name=${name}&url=${url}&version=${version}`
    );
    // declare evaluate the functionString to get the functions Object
    const evalFunc = new Function(functionString.data || "");
    functions = evalFunc();
  } catch (e) {
    console.log(e);
  }

  return {
    ui: ui.data || {},
    language: language.data || {},
    functions,
  };
}

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

async function getResources(
  { axios, storeGet },
  group,
  version,
  resource
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

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

function isEqualToDiscriminatorPath(
  { discriminator, getValue, watchDependency },
  value,
  discriminatorPath
) {
  watchDependency("discriminator#" + discriminatorPath);
  const discriminatorValue = getValue(discriminator, discriminatorPath);
  return discriminatorValue === value;
}

function setValueFromModel({ getValue, model }, path) {
  return getValue(model, path);
}

async function getNamespacedResourceList(
  axios,
  storeGet,
  { namespace, group, version, resource }
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

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
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

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

function returnTrue() {
  return true;
}

function returnStringYes() {
  return "yes";
}

// ************************* Basic Info **********************************************
async function getPostgresVersions(
  { axios, storeGet },
  group,
  version,
  resource
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

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

// ************************* Auth Secret Field ******************************************
function showAuthPasswordField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources");
  const modelPathValue = getValue(model, "/resources");
  return !!(
    modelPathValue &&
    modelPathValue.secret &&
    modelPathValue.secret.metadata &&
    modelPathValue.secret.metadata.name &&
    !showAuthSecretField({ model, getValue, watchDependency })
  );
}

function showAuthSecretField({ model, getValue, watchDependency }) {
  watchDependency("model#/resources/kubedbComPostgres/spec");
  const modelPathValue = getValue(model, "/resources/kubedbComPostgres/spec");
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
    !showAuthSecretField({ model, getValue, watchDependency }) &&
    !showAuthPasswordField({ model, getValue, watchDependency });
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

function getClientAuthModes({
  model,
  getValue,
  watchDependency,
}) {
  watchDependency("model#/resources/kubedbComPostgres/spec/version");

  const version = getValue(model, "/resources/kubedbComPostgres/spec/version")
  // major version section from version
  const major = parseInt(version && version.split(".")[0]);

  const options = ["md5", "cert"];

  if(major >= 11) {
    options.push("scram");
  }

  return options.map((item) => ({text: item, value: item }));
}

function onVersionChange({
  model,
  getValue,
  commit,
}) {
  const version = getValue(model, "/resources/kubedbComPostgres/spec/version");
  const major = parseInt(version && version.split(".")[0]);
  const defaultValue = major >= 11 ? "scram" : "md5";

  commit("wizard/model$update", {
    path: "/resources/kubedbComPostgres/spec/clientAuthMode",
    value: defaultValue,
    force: true,
  });
}

// ********************* Database Mode ***********************
function setDatabaseMode({ model, getValue, watchDependency }) {
  const modelPathValue = getValue(model, "/resources/kubedbComPostgres/spec/replicas");
  watchDependency("model#/resources/kubedbComPostgres/spec/replicas");

  if (modelPathValue > 1) {
    return "Cluster";
  } else {
    return "Standalone";
  }
}

async function getStorageClassNames(
  { axios, storeGet, commit, model, getValue }
) {
  const owner = storeGet("/user/username");
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");

  const resp = await axios.get(
    `/clusters/${owner}/${cluster}/proxy/storage.k8s.io/v1/storageclasses`,
    {
      params: {
        filter: { items: { metadata: { name: null, annotations: null } } },
      },
    }
  );

  const resources = (resp && resp.data && resp.data.items) || [];

  resources.map((item) => {
    const name = (item.metadata && item.metadata.name) || "";
    const isDefault =
      item.metadata &&
      item.metadata.annotations &&
      item.metadata.annotations["storageclass.kubernetes.io/is-default-class"];

    if (isDefault) {
      const className = getValue(
        model,
        "/resources/kubedbComPostgres/spec/storage/storageClassName"
      );
      if (!className) {
        commit("wizard/model$update", {
          path: "/resources/kubedbComPostgres/spec/storage/storageClassName",
          value: name,
          force: true,
        });
      }
    }

    item.text = name;
    item.value = name;
    return true;
  });
  return resources;
}

function deleteDatabaseModePath({
  discriminator,
  getValue,
  commit,
  model,
}) {
  const mode = getValue(discriminator, "/activeDatabaseMode");
  if (mode === "Cluster") {
    replicas = getValue(model, "/resources/kubedbComPostgres/spec/replicas");
    if(!replicas) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComPostgres/spec/replicas",
        value: 3,
        force: true,
      });
    }
  } else if (mode === "Standalone") {
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/replicas");  
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/standbyMode");
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/leaderElectiion");
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

// ************************** TLS ******************************88

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
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");
  watchDependency(
    "model#/resources/kubedbComPostgres/spec/tls/issuerRef/apiGroup"
  );
  watchDependency("model#/resources/kubedbComPostgres/spec/tls/issuerRef/kind");
  watchDependency("model#/metadata/release/namespace");
  const apiGroup = getValue(
    model,
    "/resources/kubedbComPostgres/spec/tls/issuerRef/apiGroup"
  );
  const kind = getValue(
    model,
    "/resources/kubedbComPostgres/spec/tls/issuerRef/kind"
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
  const resp = await getIssuerRefsName({
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
  const resp = await hasIssuerRefName({
    axios,
    storeGet,
    getValue,
    model,
    watchDependency,
  });

  return !resp;
}

function setSSLMode({ model, getValue }) {
  const val = getValue(model, "/resources/kubedbComPostgres/spec/sslMode");
  return val || "require";
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
      path: "/resources/kubedbComPostgres/spec/tls",
      value: { issuerRef: {}, certificates: [] },
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/tls");
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/sslMode");
  }
}

/****** Monitoring *********/

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
      path: "/resources/kubedbComPostgres/spec/monitor",
      value: {},
      force: true,
    });
  } else {
    commit("wizard/model$delete", "/resources/kubedbComPostgres/spec/monitor");
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
      path: "/resources/kubedbComPostgres/spec/monitor/prometheus/exporter",
      value: {},
      force: true,
    });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComPostgres/spec/monitor/prometheus/exporter"
    );
  }
}

// ********************************* Initialization & Backup *************************************
const stashAppscodeComRestoreSession_init = {
  spec: {
    repository: {
      name: "",
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
        name: "",
      },
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
        bucket: "",
        prefix: "",
      },
      storageSecretName: "",
    },
  },
};
const stashAppscodeComRepository_repo = {
  spec: {
    backend: {
      gcs: {
        bucket: "",
        prefix: "",
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

const stashAppscodeComBackupConfiguration = {
  spec: {
    repository: {
      name: "",
    },
    retentionPolicy: {
      keepLast: 5,
      name: "keep-last-5",
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
  },
};

function valueExists(value, getValue, path) {
  const val = getValue(value, path);
  if (val) return true;
  else return false;
}

function initPrePopulateDatabase({ getValue, model }) {
  const waitForInitialRestore = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/waitForInitialRestore"
  );
  const stashAppscodeComRestoreSession_init = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init"
  );
  const script = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/script"
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
      path: "/resources/kubedbComPostgres/spec/init/waitForInitialRestore",
      value: false,
    });
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRestoreSession_init"
    );
    commit(
      "wizard/model$delete",
      "/resources/kubedbComPostgres/spec/init/script"
    );
    commit(
      "wizard/model$delete",
      "/resources/stashAppscodeComRepository_init_repo"
    );
  } else {
    const dbName = getValue(model, "/metadata/release/name");
    // set stashAppscodeComRestoreSession_init if it doesn't exist
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSession_init"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSession_init",
        value: stashAppscodeComRestoreSession_init,
        force: true,
      });

      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComRestoreSession_init/spec/target/ref/name",
        value: dbName,
        force: true,
      });
    }
  }
}

function initDataSource({ getValue, model }) {
  const script = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/script"
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
    path: "/resources/kubedbComPostgres/spec/init/waitForInitialRestore",
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
        "/resources/kubedbComPostgres/spec/init/script"
      )
    )
      commit("wizard/model$update", {
        path: "/resources/kubedbComPostgres/spec/init/script",
        value: initScript,
      });
  } else if (dataSource === "stashBackup") {
    commit(
      "wizard/model$delete",
      "/resources/kubedbComPostgres/spec/init/script"
    );

    // create a new stashAppscodeComRestoreSession_init if there is no stashAppscodeComRestoreSession_init property
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComRestoreSession_init"
      )
    ) {
      const dbName = getValue(model, "/metadata/release/name");

      commit("wizard/model$update", {
        path: "/resources/stashAppscodeComRestoreSession_init",
        value: stashAppscodeComRestoreSession_init,
      });

      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComRestoreSession_init/spec/target/ref/name",
        value: dbName,
        force: true,
      });
    }
  }
}

// // for script
function initVolumeType({ getValue, model }) {
  const configMap = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/script/configMap/name"
  );
  const secret = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/script/secret/secretName"
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
      "/resources/kubedbComPostgres/spec/init/script/secret"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComPostgres/spec/init/script/configMap"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComPostgres/spec/init/script/configMap",
        value: {
          name: "",
        },
      });
    }
  } else if (sourceVolumeType === "secret") {
    // delete configMap object and add secret object
    commit(
      "wizard/model$delete",
      "/resources/kubedbComPostgres/spec/init/script/configMap"
    );

    if (
      !valueExists(
        model,
        getValue,
        "/resources/kubedbComPostgres/spec/init/script/secret"
      )
    ) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComPostgres/spec/init/script/secret",
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
  model,
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

    const repositoryName = `${getValue(
      model,
      "/metadata/release/name"
    )}-init-repo`;
    // set this name in stashAppscodeComRestoreSession_init
    commit("wizard/model$update", {
      path:
        "/resources/stashAppscodeComRestoreSession_init/spec/repository/name",
      value: repositoryName,
    });
  }
}

function initCustomizeRestoreJobRuntimeSettings({ getValue, model }) {
  const runtimeSettings = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init/spec/runtimeSettings"
  );
  if (runtimeSettings) return "yes";
  else return "no";
}

function initCustomizeRestoreJobRuntimeSettingsForBackup({
  getValue,
  model,
}) {
  const runtimeSettings = getValue(
    model,
    "/resources/stashAppscodeComBackupConfiguration/spec/runtimeSettings"
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

function onCustomizeRestoreJobRuntimeSettingsChangeForBackup({
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
      "/resources/stashAppscodeComBackupConfiguration/spec/runtimeSettings"
    );
  } else if (customizeRestoreJobRuntimeSettings === "yes") {
    if (
      !valueExists(
        model,
        getValue,
        "/resources/stashAppscodeComBackupConfiguration/spec/runtimeSettings"
      )
    ) {
      // set new value
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComBackupConfiguration/spec/runtimeSettings",
        value: {},
        force: true,
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

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FOR Backup Configuration

// schedule bakcup

function getBackupConfigsAndAnnotations(getValue, model) {
  const stashAppscodeComBackupConfiguration = getValue(
    model,
    "/resources/stashAppscodeComBackupConfiguration"
  );
  const kubedbComPostgresAnnotations =
    getValue(model, "/resources/kubedbComPostgres/metadata/annotations") || {};

  const isBluePrint = Object.keys(kubedbComPostgresAnnotations).some(
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
    getValue(model, "/resources/kubedbComPostgres/metadata/annotations") || {};
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
    path: "/resources/kubedbComPostgres/metadata/annotations",
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
    getValue(model, "/resources/kubedbComPostgres/metadata/annotations") || {};

  if (annotations[key] === undefined) {
    annotations[key] = value;
  } else if (force) {
    annotations[key] = value;
  }

  commit("wizard/model$update", {
    path: "/resources/kubedbComPostgres/metadata/annotations",
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
    // delete annotation from kubedbComPostgres annotation
    deleteKubeDbComMongDbAnnotation(getValue, model, commit);
  } else {
    const { isBluePrint } = getBackupConfigsAndAnnotations(getValue, model);

    // create stashAppscodeComBackupConfiguration and initialize it if not exists

    const dbName = getValue(model, "/metadata/release/name");

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
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComBackupConfiguration/spec/target/ref/name",
        value: dbName,
        force: true,
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
    const dbName = getValue(model, "/metadata/release/name");

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
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComBackupConfiguration/spec/target/ref/name",
        value: dbName,
        force: true,
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

// restore session repository
function setInitialRestoreSessionRepo({ getValue, model }) {
  const value = getValue(
    model,
    "resources/stashAppscodeComRepository_init_repo"
  );
  return value ? "create" : "select";
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
      const repositoryName = `${getValue(
        model,
        "/metadata/release/name"
      )}-repo`;
      // set this name in stashAppscodeComRestoreSession_init
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComBackupConfiguration/spec/repository/name",
        value: repositoryName,
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
    "/resources/kubedbComPostgres/metadata/annotations"
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
    getValue(model, "/resources/kubedbComPostgres/metadata/annotations") || {};
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
    path: "/resources/kubedbComPostgres/metadata/annotations",
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
    "/resources/kubedbComPostgres/spec/monitor/agent"
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
  const labels = getValue(
    model,
    "/resources/appApplication/spec/selector/matchLabels"
  );

  const agent = getValue(
    model,
    "/resources/kubedbComPostgres/spec/monitor/agent"
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

function onNameChange({ commit, model, getValue }) {
  const dbName = getValue(model, "/metadata/release/name");

  const agent = getValue(
    model,
    "/resources/kubedbComPostgres/spec/monitor/agent"
  );

  const labels = getValue(
    model,
    "/resources/appApplication/spec/selector/matchLabels"
  );

  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path:
        "/resources/monitoringCoreosComServiceMonitor/spec/selector/matchLabels",
      value: labels,
      force: true,
    });
  }

  const scheduleBackup = getValue(
    model,
    "/resources/stashAppscodeComBackupConfiguration"
  );

  if (scheduleBackup) {
    commit("wizard/model$update", {
      path:
        "/resources/stashAppscodeComBackupConfiguration/spec/target/ref/name",
      value: dbName,
      force: true,
    });
    const creatingNewRepo = getValue(
      model,
      "/resources/stashAppscodeComRepository_repo"
    );
    if (creatingNewRepo) {
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComBackupConfiguration/spec/repository/name",
        value: `${dbName}-repo`,
        force: true,
      });
    }
  }

  const prePopulateDatabase = getValue(
    model,
    "/resources/stashAppscodeComRestoreSession_init"
  );

  if (prePopulateDatabase) {
    commit("wizard/model$update", {
      path:
        "/resources/stashAppscodeComRestoreSession_init/spec/target/ref/name",
      value: dbName,
      force: true,
    });
    const creatingNewRepo = getValue(
      model,
      "/resources/stashAppscodeComRepository_init_repo"
    );
    if (creatingNewRepo) {
      commit("wizard/model$update", {
        path:
          "/resources/stashAppscodeComRestoreSession_init/spec/repository/name",
        value: `${dbName}-init-repo`,
        force: true,
      });
    }
  }

  // to reset configSecret name field
  const hasSecretConfig = getValue(model, "/resources/secret_config");
  if (hasSecretConfig) {
    commit("wizard/model$update", {
      path: "/resources/kubedbComPostgres/spec/configSecret/name",
      value: `${dbName}-config`,
      force: true,
    });
  }

  // to reset shard configSecret name field
  const hasSecretShardConfig = getValue(
    model,
    "/resources/secret_shard_config"
  );
  if (hasSecretShardConfig) {
    commit("wizard/model$update", {
      path:
        "/resources/kubedbComPostgres/spec/shardTopology/shard/configSecret/name",
      value: `${dbName}-shard-config`,
      force: true,
    });
  }

  // to reset shard configSecret name field
  const hasSecretConfigServerConfig = getValue(
    model,
    "/resources/secret_configserver_config"
  );
  if (hasSecretConfigServerConfig) {
    commit("wizard/model$update", {
      path:
        "/resources/kubedbComPostgres/spec/shardTopology/configServer/configSecret/name",
      value: `${dbName}-configserver-config`,
      force: true,
    });
  }

  // to reset mongos configSecret name field
  const hasSecretMongosConfig = getValue(
    model,
    "/resources/secret_mongos_config"
  );
  if (hasSecretMongosConfig) {
    commit("wizard/model$update", {
      path:
        "/resources/kubedbComPostgres/spec/shardTopology/mongos/configSecret/name",
      value: `${dbName}-mongos-config`,
      force: true,
    });
  }
}

function returnFalse() {
  return false;
}

function onAgentChange({ commit, model, getValue }) {
  const agent = getValue(
    model,
    "/resources/kubedbComPostgres/spec/monitor/agent"
  );
  if (agent === "prometheus.io") {
    commit("wizard/model$update", {
      path: "/resources/monitoringCoreosComServiceMonitor/spec/endpoints",
      value: [],
      force: true,
    });

    onNamespaceChange({ commit, model, getValue });
    onLabelChange({ commit, model, getValue });
  } else {
    commit(
      "wizard/model$delete",
      "/resources/monitoringCoreosComServiceMonitor"
    );
  }
}

/*************************************  Database Secret Section ********************************************/

let initialCreateAuthSecretStatus = "";

function getInitialCreateAuthSecretStatus({ model, getValue }) {
  const authSecret = getValue(
    model,
    "/resources/kubedbComPostgres/spec/authSecret"
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
    "/resources/kubedbComPostgres/spec/authSecret"
  );
  const secret_auth = getValue(model, "/resources/secret_auth");
  watchDependency("model#/resources/kubedbComPostgres/spec/authSecret");
  watchDependency("model#/resources/secret_auth");
  if (authSecret) return "has-existing-secret";
  else if (secret_auth) return "custom-secret-with-password";
  else return "custom-secret-without-password";
}

function getCreateAuthSecret({ model, getValue }) {
  return (
    getInitialCreateAuthSecretStatus({ model, getValue }) !==
    "has-existing-secret"
  );
}

function isEqualToDatabaseSecretStatus(
  { model, getValue, watchDependency },
  value
) {
  return (
    getDatabaseSecretStatus({ model, getValue, watchDependency }) === value
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

function disableInitializationSection({
  model,
  getValue,
  watchDependency,
}) {
  const initialized = getValue(
    model,
    "/resources/kubedbComPostgres/spec/init/initialized"
  );
  watchDependency("model#/resources/kubedbComPostgres/spec/init/initialized");
  return !!initialized;
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
      "/resources/kubedbComPostgres/spec/authSecret"
    );
  } else {
    const modelValue = getValue(
      model,
      "/resources/kubedbComPostgres/spec/authSecret"
    );
    if (!modelValue) {
      commit("wizard/model$update", {
        path: "/resources/kubedbComPostgres/spec/authSecret",
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
  const cluster = storeGet("/cluster/clusterDefinition/spec/name");
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
  const resp = await getSecrets({
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
  const resp = await hasExistingSecret({
    storeGet,
    axios,
    model,
    getValue,
    watchDependency,
  });
  return !resp;
}

//////////////////////////////////////// Service Monitor //////////////////////////////////////////////////////

//////////////////// service monitor ///////////////////

function isEqualToServiceMonitorType(
  { rootModel, watchDependency },
  value
) {
  watchDependency("rootModel#/spec/type");
  return rootModel && rootModel.spec && rootModel.spec.type === value;
}

//////////////////// custom config /////////////////
function onConfigurationSourceChange({
  getValue,
  discriminator,
  commit,
  model,
}) {
  const configurationSource = getValue(discriminator, "/configurationSource");
  if (configurationSource === "use-existing-config") {
    commit("wizard/model$delete", "/resources/secret_config");
  } else {
    const value = getValue(model, "/resources/secret_config");
    if (!value) {
      commit("wizard/model$update", {
        path: "/resources/secret_config",
        value: {},
        force: true,
      });
    }
    const configSecretName = `${getValue(
      model,
      "/metadata/release/name"
    )}-config`;
    commit("wizard/model$update", {
      path: "/resources/kubedbComPostgres/spec/configSecret/name",
      value: configSecretName,
      force: true,
    });
  }
}

function onConfigurationChange({
  getValue,
  commit,
  discriminator,
  model,
}) {
  const value = getValue(discriminator, "/configuration");
  commit("wizard/model$update", {
    path: "/resources/secret_config/stringData/user.conf",
    value: value,
    force: true,
  });
  const configSecretName = `${getValue(
    model,
    "/metadata/release/name"
  )}-config`;
  commit("wizard/model$update", {
    path: "/resources/kubedbComPostgres/spec/configSecret/name",
    value: configSecretName,
    force: true,
  });
}

function setConfigurationSource({ model, getValue }) {
  const modelValue = getValue(model, "/resources/secret_config");
  if (modelValue) {
    return "create-new-config";
  }
  return "use-existing-config";
}

function setSecretConfigNamespace({ getValue, model, watchDependency }) {
  watchDependency("model#/metadata/release/namespace");
  const namespace = getValue(model, "/metadata/release/namespace");
  return namespace;
}

function setConfiguration({ model, getValue }) {
  return getValue(model, "/resources/secret_config/stringData/user.conf");
}

function setConfigurationFiles({ model, getValue }) {
  const value = getValue(model, "/resources/secret_config/data/user.conf");
  return atob(value);
}

return {
	fetchJsons,
	disableLableChecker,
	isEqualToModelPathValue,
	getResources,
	isEqualToDiscriminatorPath,
	setValueFromModel,
	getNamespacedResourceList,
	getResourceList,
	resourceNames,
  unNamespacedResourceNames,
  returnTrue,
  returnStringYes,
	getPostgresVersions,
	showAuthPasswordField,
	showAuthSecretField,
	showNewSecretCreateField,
  getClientAuthModes,
  onVersionChange,
	setDatabaseMode,
	getStorageClassNames,
	deleteDatabaseModePath,
	isEqualToDatabaseMode,
	setApiGroup,
	getIssuerRefsName,
	hasIssuerRefName,
	hasNoIssuerRefName,
	setSSLMode,
	showTlsConfigureSection,
	onTlsConfigureChange,
	showMonitoringSection,
	onEnableMonitoringChange,
	showCustomizeExporterSection,
	onCustomizeExporterChange,
	valueExists,
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
	initCustomizeRestoreJobRuntimeSettings,
	initCustomizeRestoreJobRuntimeSettingsForBackup,
	onCustomizeRestoreJobRuntimeSettingsChange,
	onCustomizeRestoreJobRuntimeSettingsChangeForBackup,
	showRuntimeForm,
	getImagePullSecrets,
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
	setInitialRestoreSessionRepo,
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
	getInitialCreateAuthSecretStatus,
	getDatabaseSecretStatus,
	getCreateAuthSecret,
	isEqualToDatabaseSecretStatus,
	showPasswordSection,
	disableInitializationSection,
	encodePassword,
	decodePassword,
	onCreateAuthSecretChange,
	getSecrets,
	hasExistingSecret,
	hasNoExistingSecret,
	isEqualToServiceMonitorType,
	onConfigurationSourceChange,
	onConfigurationChange,
	setConfigurationSource,
	setSecretConfigNamespace,
	setConfiguration,
	setConfigurationFiles,
}