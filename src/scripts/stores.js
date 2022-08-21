import { writable } from 'svelte/store';
import { readable } from 'svelte/store';
import {windowWidth, windowHeight } from '../scripts/windowSize';

//exports
export const themeData = writable([]);
export const apiKey = writable('');
export const binURL = writable('');
export const loading = writable(false);
export const baseURL = writable('https://api.jsonbin.io/v3/b/');
export const tutorialURL = readable('https://www.youtube.com');

//CREATE THEME VARS

//ui vars
export const mainSection = writable('themes');
export const createThemeUI = writable(false);
export const onboarding = writable(false);
export const deleteTheme = writable(false);
export const step = writable(1);
export const winWidth = writable(windowWidth());
export const winHeight = writable(windowHeight());
export const themeToDelete = writable('');
export const selectedTheme = writable('');
export const reOrdered = writable(false);

//capture where to pull styles from
//this is set to local since by default, themer will try to create themes from local styles vs. a selection
export const styleSource = writable('local');

//capture which type of styles to include
export const styleTypeColor = writable(true); 
export const styleTypeText = writable(false);
export const styleTypeEffect = writable(false);