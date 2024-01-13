import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
	important: true,
	theme: {
		extend: {
			colors: {
				secondary: colors.cyan
			}
		}
	}
} as Partial<Config>;
