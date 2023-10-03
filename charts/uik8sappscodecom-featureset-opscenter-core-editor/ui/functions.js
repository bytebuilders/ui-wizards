// *************************      common functions ********************************************
// eslint-disable-next-line no-empty-pattern

// get specific feature details
function getFeatureSetDetails(storeGet) {
  const featureSets = storeGet("/cluster/featureSets/result") || [];
  const featureSetName = storeGet("/route/params/featureset") || "";
  const featureSet = featureSets.find(
    (item) => item?.metadata?.name === featureSetName
  );
  return featureSet;
}

// get specific attribute's value of a feature
function getFeatureSetPropertyValue(storeGet, getValue, path) {
  const featureSet = getFeatureSetDetails(storeGet);
  const value = getValue(featureSet, path);
  return value;
}

function getFeatureSetDescription({ storeGet, getValue }) {
  const description = getFeatureSetPropertyValue(
    storeGet,
    getValue,
    "/spec/description"
  );
  return description;
}

// get specific feature details
function getFeatureDetails(storeGet, name) {
  const features = storeGet("/cluster/features/result") || [];
  const feature = features.find((item) => item?.metadata?.name === name);
  return feature;
}

// get specific attribute's value of a feature
function getFeaturePropertyValue(storeGet, name, getValue, path) {
  const feature = getFeatureDetails(storeGet, name);
  const value = getValue(feature, path);
  return value;
}

function isEqualToModelPathValue(
  { model, getValue, watchDependency },
  path,
  value
) {
  watchDependency(`model#${path}`);

  const modelValue = getValue(model, path);
  return modelValue === value;
}

function isFeatureRequired(storeGet,featureName) {

  

  const featureSet = getFeatureSetDetails(storeGet);
  const requiredFeatures = featureSet?.spec?.requiredFeatures || [];
  const isRequired = requiredFeatures.includes(featureName);

  return isRequired;
}

function getEnabledFeatures({ storeGet }) {
  const allFeatures = storeGet("/cluster/features/result") || [];
  const featureSet = storeGet("/route/params/featureset") || [];
  const featureBlock = storeGet("/route/query/activeBlock") || "";
  const configureMode = storeGet("/route/query/mode") || "";

  const allFeatureSetFeature =
    allFeatures.filter((item) => {
      return item?.spec?.featureSet === featureSet;
    }) || [];

  // if user click on featureSet configure btn
  if (configureMode) {
    // filter only (enabled + required) feature of a feature set
    const enabledFeatures = allFeatureSetFeature.filter((item) => {
      const featureName = item?.metadata?.name;
      return item?.status?.enabled || isFeatureRequired(storeGet, featureName);
    });
    const enabledFeatureNames =
      enabledFeatures.map((item) => item?.metadata?.name) || [];
    return enabledFeatureNames;
  } else {
    // if user click feature block enable btn
    if (featureBlock) {
      
      // filter only (enabled + required + feature block feature)
      const enabledFeatures = allFeatureSetFeature.filter((item) => {
        const featureName = item?.metadata?.name;
        return (
          item?.status?.enabled ||
          isFeatureRequired(storeGet, featureName) ||
          item?.spec?.featureBlock === featureBlock
        );
      });
      const enabledFeatureNames =
        enabledFeatures.map((item) => item?.metadata?.name) || [];
      return enabledFeatureNames;
    }
    // is user click feature set enable btn
    else {
      // filter only (enabled + required + recommended)
      const enabledFeatures = allFeatureSetFeature.filter((item) => {
        const featureName = item?.metadata?.name;
        return (
          item?.status?.enabled ||
          item?.spec?.recommended ||
          isFeatureRequired(storeGet,featureName)
        );
      });
      const enabledFeatureNames =
        enabledFeatures.map((item) => item?.metadata?.name) || [];
      return enabledFeatureNames;
    }
  }
}

function disableFeatures({ storeGet, itemCtx }) {
  const featureName = itemCtx.value;
  const featureSet = getFeatureSetDetails(storeGet);
  const requiredFeatures = featureSet?.spec?.requiredFeatures || [];

  if (requiredFeatures.includes(featureName)) return true;
  else return false;
}

function getResourceValuePathFromFeature(feature) {
  const featureName = feature?.metadata?.name || "";
  const underscoredFeatureName = featureName.toLowerCase().replaceAll("-", "_");
  const resourceValuePath = `helmToolkitFluxcdIoHelmRelease_${underscoredFeatureName}`;
  return resourceValuePath;
}

function onEnabledFeaturesChange({
  discriminator,
  getValue,
  commit,
  storeGet,
}) {
  const enabledFeatures = getValue(discriminator, "/enabledFeatures") || [];

  const allFeatures = storeGet("/cluster/features/result") || [];

  allFeatures.forEach((item) => {
    const featureName = item?.metadata?.name || "";
    const resourceValuePath = getResourceValuePathFromFeature(item);

    if (enabledFeatures.includes(featureName)) {
      const featureSet = storeGet("/route/params/featureset") || "";
      const chart = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/spec/chart/name"
      );
      const targetNamespace = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/spec/chart/namespace"
      );
      const sourceRef = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/spec/chart/sourceRef"
      );
      const version = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/spec/chart/version"
      );

      const isEnabled = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/status/enabled"
      );
      const isManaged = getFeaturePropertyValue(
        storeGet,
        featureName,
        getValue,
        "/status/managed"
      );

      if (isEnabled && !isManaged) {
        commit("wizard/model$delete", `/resources/${resourceValuePath}`);
      } else {
        commit("wizard/model$update", {
          path: `/resources/${resourceValuePath}`,
          value: {
            ...resources?.[resourceValuePath],
            metadata: {
              ...resources?.[resourceValuePath]?.metadata,
              labels: {
                ...resources?.[resourceValuePath]?.metadata?.labels,
                "app.kubernetes.io/component": featureName,
                "app.kubernetes.io/part-of": featureSet,
              },
            },
            spec: {
              ...resources?.[resourceValuePath]?.spec,
              chart: {
                spec: {
                  chart,
                  sourceRef,
                  version,
                },
              },
              targetNamespace,
            },
          },
          force: true,
        });
      }
    } else {
      commit("wizard/model$delete", `/resources/${resourceValuePath}`);
    }
  });
}

let resources = {};

function returnFalse() {
  return false;
}

async function setReleaseNameAndNamespaceAndInitializeValues({
  commit,
  storeGet,
  model,
  getValue,
  axios,
}) {
  const modelResources = getValue(model, "/resources");
  resources = { ...modelResources };

  const isFeatureSetInstalled = getFeatureSetPropertyValue(
    storeGet,
    getValue,
    "/status/enabled"
  );

  if (isFeatureSetInstalled) {
    // get resources deafult values when featureset is installed
    const owner = storeGet("/route/params/user");
    const cluster = storeGet("/route/params/cluster");

    const {
      name: chartName,
      sourceRef,
      version: chartVersion,
    } = getFeatureSetPropertyValue(storeGet, getValue, "/spec/chart");
    const { data } = await axios.get(
      `/clusters/${owner}/${cluster}/helm/packageview/values?name=${chartName}&sourceApiGroup=${sourceRef.apiGroup}&sourceKind=${sourceRef.kind}&sourceNamespace=${sourceRef.namespace}&sourceName=${sourceRef.name}&version=${chartVersion}&format=json`
    );
    const { resources: resourcesDefaultValues } = data || {};

    Object.keys(resourcesDefaultValues || {}).forEach((key) => {
      if (!resources[key]) {
        resources[key] = resourcesDefaultValues[key];
      }
    });
  }
  const featureSet = storeGet("/route/params/featureset");
  commit("wizard/model$update", {
    path: "/metadata/release",
    value: {
      name: featureSet,
      namespace: "kubeops",
    },
    force: true,
  });

  // delete extra values from model if the feature does not exist
  const allFeatures = storeGet("/cluster/features/result") || [];
  const allFeatureResourceValuePathNames = allFeatures.map((feature) =>
    getResourceValuePathFromFeature(feature)
  );
  Object.keys(modelResources).forEach((modelResourcePath) => {
    if (!allFeatureResourceValuePathNames.includes(modelResourcePath)) {
      // model path does not exist in feature values
      // remove the model path
      commit("wizard/model$delete", `/resources/${modelResourcePath}`);
    }
  });
}

function fetchFeatureSetOptions({ storeGet }) {
  const features = storeGet("/cluster/features/result") || [];
  const featureSetName = storeGet("/route/params/featureset");
  const filteredFeatures = features.filter(
    (item) => item?.spec?.featureSet === featureSetName
  );
  const options = filteredFeatures.map((item) => {
    const { spec, metadata } = item || {};
    const { title, description, required } = spec || {};
    const { name } = metadata || {};
    return {
      text: title,
      value: name,
      description: description,
      statusTag: {
        text: required ? "Required" : "",
      },
    };
  });

  return options || [];
}

return {
  getFeatureSetDetails,
  getFeatureSetPropertyValue,
  getFeatureSetDescription,
  isEqualToModelPathValue,
  getEnabledFeatures,
  disableFeatures,
  onEnabledFeaturesChange,
  returnFalse,
  setReleaseNameAndNamespaceAndInitializeValues,
  fetchFeatureSetOptions,
};
