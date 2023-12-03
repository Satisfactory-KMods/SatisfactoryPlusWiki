import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
	theme: {
		extend: {
			colors: {
				secondary: colors.cyan
			}
		}
	}
} as Partial<Config>;
