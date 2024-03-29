import type { SFItemForm } from './satisfactoryExtractorTypes';

export type ItemDisplay = {
	path: string;
	name: string;
	image: string;
	form: SFItemForm;
};

export type CummonDisplayBox = {
	to: string | null;
	label: string;
	image: string | null;
};

export {};
