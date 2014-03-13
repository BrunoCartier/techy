module.exports = function(api) {
	api.add({
		'body, html': {
			wid: '100%',
			hei: '100%',
			pad: 0,
			mar: 0,
			fz: '18px',
			lh: '24px',
			ff: "'Average Sans', sans-serif",
			color: api.settings.textColor,
			bg: api.settings.bgColor
		},
		a: {
			fw: 'b',
			color: api.settings.textColor,
			ted: 'n',
			'&:hover': {
				color: api.settings.brandColor1,
				bdb: 'dotted 1px ' + api.settings.borderColor
			}
		},
		p: {
			fz: '24px',
			lh: '34px'
		},
		hr: {
			bdb: 'n',
			bdt: 'solid 4px ' + api.lighten(api.settings.borderColor, 50)
		},
		blockquote: {
			bdl: 'solid 4px #999',
			pad: ' 0 0 0 20px',
			mar: 0,	
			p: {
				color: '#999'
			}
		},
		table: {
			bdsp: 0,
			td: {
				bdt: 'solid 1px #B3B3B3',
				bdl: 'solid 1px #B3B3B3',
				pad: '6px',
				'word-wrap': 'break-word'
			}
		},
		'.left': { fl: 'l' },
		'.right': { fl: 'r' }
	});

}