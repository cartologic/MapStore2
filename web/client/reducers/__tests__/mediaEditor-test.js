/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
import expect from 'expect';
import mediaEditor, {DEFAULT_STATE} from '../mediaEditor';
const {
    chooseMedia,
    hide,
    loadMediaSuccess,
    selectItem,
    setAddingMedia,
    setEditingMedia,
    show
} = require('../../actions/mediaEditor');

describe('Test the mediaEditor reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = mediaEditor(undefined, {type: 'UNKNOWN'}); // TODO: check default
        expect(state).toEqual(DEFAULT_STATE);
    });
    it('ADDING_MEDIA', () => {
        const adding = false;
        let state = mediaEditor({}, setAddingMedia(adding));
        expect(state.saveState.addingMedia).toEqual(adding);
        expect(state.selected).toEqual("");
    });
    it('EDITING_MEDIA', () => {
        const editing = false;
        let state = mediaEditor({}, setEditingMedia(editing));
        expect(state.saveState.addingMedia).toEqual(editing);
        expect(state.saveState.editing).toEqual(editing);
    });
    it('CHOOSE_MEDIA', () => {
        let state = mediaEditor({}, chooseMedia());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual(undefined);
        expect(state.stashedSettings).toEqual(undefined);

        // if there is a stashed change
        state = mediaEditor({stashedSettings: {setting1: true}}, chooseMedia());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual({setting1: true});
        expect(state.stashedSettings).toEqual(undefined);
    });
    it('HIDE', () => {
        let state = mediaEditor({}, hide());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual(undefined);
        expect(state.settings).toEqual(undefined);
        expect(state.selected).toEqual("");
        expect(state.saveState).toEqual({editing: false, addingMedia: false});
        expect(state.stashedSettings).toEqual(undefined);

        // if there is a stashed change
        state = mediaEditor({stashedSettings: {setting1: true}}, hide());
        expect(state.open).toEqual(false);
        expect(state.owner).toEqual(undefined);
        expect(state.settings).toEqual({setting1: true});
        expect(state.stashedSettings).toEqual(undefined);
    });
    it('LOAD_MEDIA_SUCCESS', () => {
        const mediaType = "image";
        const sourceId = "id";
        const params = "params";
        const resultData = {};
        let state = mediaEditor({}, loadMediaSuccess({mediaType, sourceId, params, resultData}));
        expect(state.data[mediaType][sourceId]).toEqual({ params, resultData });
    });
    it('SELECT_ITEM', () => {
        const id = "id";
        let state = mediaEditor({}, selectItem(id));
        expect(state.selected).toEqual(id);
    });
    it('SHOW', () => {
        const owner = "owner";
        const open = true;
        let state = mediaEditor({}, show(owner));
        expect(state.open).toEqual(open);
        expect(state.owner).toEqual(owner);
    });
});
