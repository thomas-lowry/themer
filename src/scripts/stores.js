import { writable } from 'svelte/store';
import { readable } from 'svelte/store';

//exports
export const themes = readable([]);
//export const themes = readable([{name: 'themeA'}, {name: 'themeB'}, {name: 'themeC'}, {name: 'themeD'}, {name: 'themeE'}, {name: 'themeF'}, {name: 'themeG'}, {name: 'themeH'}, {name: 'themeI'}, {name: 'themeJ'}, {name: 'themeK'}, {name: 'themeJ'}, {name: 'themeL'}]);
export const mainSection = writable('themes');
export const flow = writable('themeList'); //themelist, createTheme, onboarding, deleteTheme, loading
export const apiKey = writable('');
export const binURL = writable('');
export const loading = writable(true);