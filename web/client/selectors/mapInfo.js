/*
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const { get, omit, isArray } = require('lodash');

const { createSelector, createStructuredSelector } = require('reselect');

const {mapSelector} = require('./map');
const { currentLocaleSelector } = require('./locale');
const MapInfoUtils = require('../utils/MapInfoUtils');

const {queryPanelSelector} = require('./controls');

/**
 * selects mapinfo state
 * @name mapinfo
 * @memberof selectors
 * @static
 */

/**
  * Get mapinfo requests from state
  * @function
  * @memberof selectors.mapinfo
  * @param  {object} state the state
  * @return {object} the mapinfo requests
  */
const mapInfoRequestsSelector = state => get(state, "mapInfo.requests") || [];
const isMapInfoOpen = state => !!mapInfoRequestsSelector(state) && mapInfoRequestsSelector(state).length > 0;

/**
 * selects generalInfoFormat from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {string}       the maptype in the state
 */
const generalInfoFormatSelector = (state) => get(state, "mapInfo.configuration.infoFormat", "text/plain");
const showEmptyMessageGFISelector = (state) => get(state, "mapInfo.configuration.showEmptyMessageGFI", true);
const mapInfoConfigurationSelector = (state) => get(state, "mapInfo.configuration", {});

const measureActiveSelector = (state) => get(state, "controls.measure.enabled") && (get(state, "measurement.lineMeasureEnabled") || get(state, "measurement.areaMeasureEnabled") || get(state, "measurement.bearingMeasureEnabled"));
/**
 * Clicked point of mapInfo
 * @param {object} state the state
 */
const clickPointSelector = state => state && state.mapInfo && state.mapInfo.clickPoint;
const clickLayerSelector = state => state && state.mapInfo && state.mapInfo.clickLayer;
const showMarkerSelector = state => state && state.mapInfo && state.mapInfo.showMarker;
const itemIdSelector = state => get(state, "mapInfo.itemId", null);
const overrideParamsSelector = state => get(state, "mapInfo.overrideParams", {});
const filterNameListSelector = state => get(state, "mapInfo.filterNameList", []);
const drawSupportActiveSelector = (state) => {
    const drawStatus = get(state, "draw.drawStatus", false);
    return drawStatus && drawStatus !== 'clean' && drawStatus !== 'stop';
};
const annotationsEditingSelector = (state) => get(state, "annotations.editing");
const mapInfoDisabledSelector = (state) => !get(state, "mapInfo.enabled", false);

/**
 * selects stopGetFeatureInfo from state
 * @memberof selectors.mapinfo
 * @param  {object} state the state
 * @return {boolean} true if the get feature info has to stop the request
 */
const stopGetFeatureInfoSelector = createSelector(
    mapInfoDisabledSelector,
    measureActiveSelector,
    drawSupportActiveSelector,
    annotationsEditingSelector,
    queryPanelSelector,
    (isMapInfoDisabled, isMeasureActive, isDrawSupportActive, isAnnotationsEditing, isQueryPanelActive) =>
        isMapInfoDisabled
        || !!isMeasureActive
        || isDrawSupportActive
        || !!isAnnotationsEditing
        || !!isQueryPanelActive
    );

/**
 * Defines the general options of the identifyTool to build the request
 */
const identifyOptionsSelector = createStructuredSelector({
        format: generalInfoFormatSelector,
        map: mapSelector,
        point: clickPointSelector,
        currentLocale: currentLocaleSelector
    });

const isHighlightEnabledSelector = (state = {}) => state.mapInfo && state.mapInfo.highlight;

const indexSelector = (state = {}) => state && state.mapInfo && state.mapInfo.index;

const responsesSelector = state => state.mapInfo && state.mapInfo.responses || [];

/**
 * Gets only the valid responses
 */
const validResponsesSelector = createSelector(
    responsesSelector,
    generalInfoFormatSelector,
    (responses, format) => {
        const validatorFormat = MapInfoUtils.getValidator(format);
        return validatorFormat.getValidResponses(responses);
    });

const currentResponseSelector = createSelector(
    validResponsesSelector, indexSelector,
    (responses = [], index = 0) => responses[index]
);
const currentFeatureSelector = state => {
    const currentResponse = currentResponseSelector(state) || {};
    return get(currentResponse, 'layerMetadata.features');
};
const currentFeatureCrsSelector = state => {
    const currentResponse = currentResponseSelector(state) || {};
    return get(currentResponse, 'layerMetadata.featuresCrs');
};

/**
 * Returns the a function that returns the correct style based on the geometry type, to use in the highlight
 * @param {feature} f the feature in json format
 */
const getStyleForFeature = (style) => (f = {}) =>
    f.style
        || (f.geometry && (f.geometry.type === "Point" || f.geometry.type === "MultiPoint"))
            // point style circle requires radius (it's strange circle should be a default)
            ? style
            // no radius means normal polygon, line or other. TODO: fix VectorStyle to omit radius automatically
            : omit(style, 'radius');
/**
 * Create a function that add the style property to the feature.
 */
const applyMapInfoStyle = style => f => ({
    ...f,
    style: getStyleForFeature(style)(f)
});
/**
 * gets the configured state for highlight mapInfo features.
 * @param {object} state the application state
 * @returns {object} style object
 */
const highlightStyleSelector = state => get(state, 'mapInfo.highlightStyle', {
    color: '#3388ff',
    weight: 4,
    radius: 4,
    dashArray: '',
    fillColor: '#3388ff',
    fillOpacity: 0.2
});

const clickedPointWithFeaturesSelector = createSelector(
    clickPointSelector,
    isHighlightEnabledSelector,
    currentFeatureSelector,
    currentFeatureCrsSelector,
    showMarkerSelector,
    highlightStyleSelector,
    (clickPoint, highlight, features, featuresCrs, showMarker, style) => showMarker && clickPoint
        ? highlight
            ? {
                ...clickPoint,
                featuresCrs,
                features: features && isArray(features)
                    && features
                        .map(applyMapInfoStyle(style))
            }
            : clickPoint
        : undefined

);


module.exports = {
    isMapInfoOpen,
    indexSelector,
    responsesSelector,
    validResponsesSelector,
    currentFeatureSelector,
    currentFeatureCrsSelector,
    clickedPointWithFeaturesSelector,
    highlightStyleSelector,
    identifyOptionsSelector,
    clickPointSelector,
    clickLayerSelector,
    generalInfoFormatSelector,
    mapInfoRequestsSelector,
    stopGetFeatureInfoSelector,
    showEmptyMessageGFISelector,
    mapInfoConfigurationSelector,
    isHighlightEnabledSelector,
    itemIdSelector,
    overrideParamsSelector,
    filterNameListSelector
};
