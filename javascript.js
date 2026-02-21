const app = document.getElementById('app');

const steps = [
	{
		id: 'start',
		type: 'start',
		title: 'Bewerbung für das PAPAIS Franchise',
		desc:
			'Werden Sie Teil unseres wachsenden Systems und eröffnen Sie Ihre eigene PAPAIS-Filiale.',
		buttonLabel: 'Jetzt starten',
	},
	{
		id: 'email',
		type: 'input',
		required: true,
		title: 'Bitte geben Sie Ihre E-Mail-Adresse an.*',
		desc:
			'Wir verwenden Ihre E-Mail-Adresse, um Sie über den Status Ihrer Bewerbung zu informieren.',
		placeholder: 'name@beispiel.de',
		validate: 'email',
		buttonLabel: 'Weiter',
	},
	{
		id: 'motivation',
		type: 'input',
		required: true,
		title: 'Warum möchten Sie PAPAIS-Franchisenehmer werden?*',
		desc: 'Wir möchten verstehen, was Sie antreibt.',
		placeholder: 'Antwort hier...',
		buttonLabel: 'Weiter',
	},
	{
		id: 'operational_involvement', // was "interest"
		type: 'single',
		required: true,
		title: 'Sind Sie bereit, täglich aktiv im operativen Betrieb mitzuarbeiten?',
		options: [
			{ label: 'Ja' },
			{ label: 'Nein' },
		],
		buttonLabel: 'Weiter',
	},
	{
		id: 'experience', // was "operativ"
		type: 'input',
		required: true,
		title:
			'Welche Erfahrung bringen Sie in der Mitarbeiterführung sowie im Gastronomie- oder Servicebereich mit?*',
		placeholder: 'Antwort hier...',
		buttonLabel: 'Weiter',
	},
	{
		id: 'system_commitment', // was "leadership"
		type: 'single',
		required: true,
		title:
			'Sind Sie bereit, ein standardisiertes Franchise-System konsequent umzusetzen?*',
		options: [
			{ label: 'Ja' },
			{ label: 'Nein' },
		],
		buttonLabel: 'Weiter',
	},
	{
		id: 'preferred_region', // was "standard"
		type: 'input',
		required: true,
		title:
			'In welcher Stadt oder Region möchten Sie Ihre PAPAIS-Filiale eröffnen?*',
		placeholder: 'Antwort hier...',
		buttonLabel: 'Weiter',
	},
	{
		id: 'location_timeline', // was "region"
		type: 'multi',
		required: true,
		title: 'Wie sieht Ihr aktueller Standort- und Zeitplan aus?*',
		options: [
			{ label: 'Standort vorhanden – Investition sofort' },
			{ label: 'Standort vorhanden – innerhalb von 6 Monaten' },
			{ label: 'Standort vorhanden – innerhalb von 12 Monaten' },
			{ label: 'Standort noch offen' },
		],
		buttonLabel: 'Weiter',
	},
	{
		id: 'financial_capacity', // was "timeline"
		type: 'single',
		required: true,
		title:
			'Verfügen Sie über mindestens 350.000 € Eigenkapital und können Sie bei Bedarf zusätzliche Finanzierung sichern?*',
		options: [
			{ label: 'Ja' },
			{ label: 'Nein' },
		],
		buttonLabel: 'Weiter',
	},
	{
		id: 'contact',
		type: 'contact',
		required: true,
		title: 'Kontaktdaten',
		fields: [
			{ id: 'firstName', label: 'Vorname', placeholder: 'Anne' },
			{ id: 'lastName', label: 'Nachname', placeholder: 'Schmidt' },
			{ id: 'phone', label: 'Telefonnummer', placeholder: '01512 3456789' },
		],
		buttonLabel: 'Senden',
		helper: 'Drücken Sie Cmd ⌘ + Enter ↵',
	},
	{
		id: 'done',
		type: 'submit',
		title: 'Danke für dein Interesse!',
		desc: 'Vielen Dank für deine Anfrage zu unserem Franchise-Konzept. Wir haben deine Informationen erhalten und werden uns so schnell wie möglich bei dir melden.',
	},
];

const state = {
	index: 0,
	answers: {},
	error: '',
	lastDirection: 'forward',
	submitted: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const questionSteps = steps.filter(
	(step) => step.type !== 'start' && step.type !== 'submit'
);

function getStepNumber(step) {
	if (step.type === 'start' || step.type === 'submit') return null;
	const activeIndex = questionSteps.findIndex((item) => item.id === step.id);
	if (activeIndex === -1) return null;
	return activeIndex + 1;
}

function setError(message) {
	state.error = message;
	render(true);
	applyErrorAnimation();
	focusFirstField();
}

function clearError() {
	if (state.error) {
		state.error = '';
		render();
	}
}

function goNext(options = {}) {
	const { suppressAnimation = false } = options;
	const step = steps[state.index];
	const validation = validateStep(step);
	if (!validation.ok) {
		setError(validation.message);
		return;
	}
	clearError();
	if (state.index < steps.length - 1) {
		const nextStep = steps[state.index + 1];
		if (nextStep && nextStep.type === 'submit') {
			submitAnswers();
		}
		state.lastDirection = 'forward';
		state.index += 1;
		render(suppressAnimation);
	}
}

function goPrev() {
	if (state.index > 0) {
		state.lastDirection = 'back';
		state.index -= 1;
		clearError();
		render();
	}
}

function validateStep(step) {
	if (!step.required) return { ok: true };
	const value = state.answers[step.id];

	if (step.type === 'input' || step.type === 'textarea' || step.type === 'select') {
		if (!value || !String(value).trim()) {
			return { ok: false, message: 'Bitte ausfüllen' };
		}
		if (step.validate === 'email' && !emailRegex.test(String(value).trim())) {
			return { ok: false, message: 'Diese E-Mail-Adresse ist ungültig.' };
		}
		return { ok: true };
	}

	if (step.type === 'single') {
		if (!value) return { ok: false, message: 'Bitte wählen Sie eine Option.' };
		return { ok: true };
	}

	if (step.type === 'multi') {
		if (!Array.isArray(value) || value.length === 0) {
			return { ok: false, message: 'Bitte wählen Sie mindestens eine Option.' };
		}
		return { ok: true };
	}

	if (step.type === 'contact') {
		if (!value || typeof value !== 'object') {
			return { ok: false, message: 'Bitte alle Felder ausfüllen.' };
		}
		for (const field of step.fields) {
			const fieldValue = value[field.id];
			if (!fieldValue || !String(fieldValue).trim()) {
				return { ok: false, message: 'Bitte alle Felder ausfüllen.' };
			}
			if (field.validate === 'email' && !emailRegex.test(String(fieldValue).trim())) {
				return { ok: false, message: 'Diese E-Mail-Adresse ist ungültig.' };
			}
		}
		return { ok: true };
	}

	return { ok: true };
}

function renderStepper(step) {
	if (step.type === 'start' || step.type === 'submit') return null;

	const activeIndex = questionSteps.findIndex((item) => item.id === step.id);
	const progress = document.createElement('div');
	progress.className = 'progress';

	const fill = document.createElement('div');
	fill.className = 'progress__fill';

	const percentage =
		questionSteps.length > 0
			? Math.round(((activeIndex + 1) / questionSteps.length) * 100)
			: 0;

	fill.style.width = `${percentage}%`;
	progress.appendChild(fill);

	return progress;
}

function renderHeader(step, index) {
	const header = document.createElement('header');
	header.className = 'gap-8';

	const title = document.createElement('h2');
	title.className = step.type === 'start' ? 'heading' : 'q__title';
	title.textContent = step.title;
	if (step.type !== 'start' && step.type !== 'submit' && typeof index === 'number') {
		title.setAttribute('data-index', String(index));
	}

	header.appendChild(title);

	if (step.desc) {
		const desc = document.createElement('p');
		desc.className = step.type === 'start' ? 'paragraph' : 'q__desc';
		desc.textContent = step.desc;
		header.appendChild(desc);
	}

	return header;
}

function renderError() {
	if (!state.error) return null;

	const error = document.createElement('div');
	error.className = 'input-error';
	error.innerHTML = `
		<svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
			<path fill="currentColor" d="M7.173 11.493a.828.828 0 1 1 1.655 0 .828.828 0 0 1-1.655 0"></path>
			<path fill="currentColor" d="M6.065 2.562c.872-1.468 2.998-1.468 3.87 0L15.3 11.6c.89 1.5-.19 3.398-1.935 3.398H2.635C.89 14.997-.19 13.098.7 11.599zm2.58.766a.75.75 0 0 0-1.23-.086l-.06.086-5.365 9.036a.75.75 0 0 0 .645 1.133h10.73a.75.75 0 0 0 .645-1.133zM7.25 9V6.804a.75.75 0 0 1 1.5 0V9a.75.75 0 1 1-1.5 0"></path>
		</svg>
		<span>${state.error}</span>
	`;

	return error;
}

function renderInput(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = step.placeholder || '';
	input.value = state.answers[step.id] || '';
	input.addEventListener('input', (event) => {
		state.answers[step.id] = event.target.value;
		clearError();
	});

	wrapper.appendChild(input);
	return wrapper;
}

function renderTextarea(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	const textarea = document.createElement('input');
	textarea.placeholder = step.placeholder || '';
	textarea.value = state.answers[step.id] || '';
	textarea.addEventListener('input', (event) => {
		state.answers[step.id] = event.target.value;
		clearError();
	});

	wrapper.appendChild(textarea);
	return wrapper;
}

function renderSelect(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	const select = document.createElement('select');
	const placeholder = document.createElement('option');
	placeholder.value = '';
	placeholder.textContent = step.placeholder || 'Bitte wählen';
	select.appendChild(placeholder);

	step.options.forEach((option) => {
		const opt = document.createElement('option');
		opt.value = option.label;
		opt.textContent = option.label;
		select.appendChild(opt);
	});

	select.value = state.answers[step.id] || '';
	select.addEventListener('change', (event) => {
		state.answers[step.id] = event.target.value;
		clearError();
	});

	wrapper.appendChild(select);
	return wrapper;
}

function renderSingle(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	step.options.forEach((option, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'option-button';

		const badge = document.createElement('span');
		badge.className = 'option-button__badge';
		badge.textContent = String.fromCharCode(65 + index);

		const label = document.createElement('span');
		label.textContent = option.label;

		if (state.answers[step.id] === option.label) {
			button.classList.add('is-active');
		}

		button.addEventListener('click', () => {
			state.answers[step.id] = option.label;
			clearError();
			goNext({ suppressAnimation: true });
		});

		button.appendChild(badge);
		button.appendChild(label);
		wrapper.appendChild(button);
	});

	return wrapper;
}

function renderMulti(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	const selected = Array.isArray(state.answers[step.id])
		? state.answers[step.id]
		: [];

	step.options.forEach((option, index) => {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'option-button';

		const badge = document.createElement('span');
		badge.className = 'option-button__badge';
		badge.textContent = String.fromCharCode(65 + index);

		const label = document.createElement('span');
		label.textContent = option.label;

		if (selected.includes(option.label)) {
			button.classList.add('is-active');
		}

		button.addEventListener('click', () => {
			const next = new Set(selected);
			if (next.has(option.label)) {
				next.delete(option.label);
			} else {
				next.add(option.label);
			}
			state.answers[step.id] = Array.from(next);
			clearError();
			render(true);
		});

		button.appendChild(badge);
		button.appendChild(label);
		wrapper.appendChild(button);
	});

	return wrapper;
}

function renderContact(step) {
	const wrapper = document.createElement('div');
	wrapper.className = 'input-group';

	const stored = state.answers[step.id] || {};

	step.fields.forEach((field) => {
		const label = document.createElement('label');
		label.className = 'q__desc';
		label.textContent = field.label;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = field.placeholder || '';
		input.value = stored[field.id] || '';
		input.addEventListener('input', (event) => {
			state.answers[step.id] = {
				...(state.answers[step.id] || {}),
				[field.id]: event.target.value,
			};
			clearError();
		});

		wrapper.appendChild(label);
		wrapper.appendChild(input);
	});

	return wrapper;
}

function renderActions(step) {
	if (step.type === 'submit') {
		return document.createElement('div');
	}
	const row = document.createElement('div');
	row.className = 'button-row';

	if (state.index > 0 && step.type !== 'submit') {
		const back = document.createElement('button');
		back.type = 'button';
		back.className = 'button';
		back.textContent = 'Zurück';
		back.addEventListener('click', goPrev);
		row.appendChild(back);
	}

	const next = document.createElement('button');
	next.type = 'button';
	next.className = 'button';
	next.textContent = step.buttonLabel || 'Weiter';
	next.addEventListener('click', () => {
		goNext();
	});
	row.appendChild(next);

	if (step.helper) {
		const helper = document.createElement('span');
		helper.className = 'helper';
		helper.textContent = step.helper;
		row.appendChild(helper);
	}

	return row;
}

function renderStepBody(step) {
	if (step.type === 'start') return null;
	if (step.type === 'input') return renderInput(step);
	if (step.type === 'textarea') return renderTextarea(step);
	if (step.type === 'select') return renderSelect(step);
	if (step.type === 'single') return renderSingle(step);
	if (step.type === 'multi') return renderMulti(step);
	if (step.type === 'contact') return renderContact(step);
	return null;
}

function submitAnswers() {
	if (state.submitted) return;
	state.submitted = true;
	const payload = {
		timestamp: new Date().toISOString(),
		answers: state.answers,
	};
	fetch('https://hook.eu1.make.com/b6v98xhxj1sfnibovkfj292xcrv3kg7i', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	}).catch((error) => {
		console.error('Webhook submit failed', error);
	});
}

function render(suppressEnterAnimation = false) {
	app.innerHTML = '';
	const step = steps[state.index];

	if (step.type === 'start') {
		app.classList.add('text-center');
		app.classList.add('is-start');
	} else {
		app.classList.remove('text-center');
		app.classList.remove('is-start');
	}

	const stepper = renderStepper(step);
	if (stepper) app.appendChild(stepper);

	app.appendChild(renderHeader(step, getStepNumber(step)));

	const body = renderStepBody(step);
	if (body) app.appendChild(body);

	const error = renderError();
	if (error) app.appendChild(error);

	app.appendChild(renderActions(step));
	if (!suppressEnterAnimation) {
		applyScreenAnimation();
	}
	focusFirstField();
}

function focusFirstField() {
	requestAnimationFrame(() => {
		const input = app.querySelector('input[type="text"]');
		const textarea = app.querySelector('textarea');
		const select = app.querySelector('select');
		const focusTarget = input || textarea || select;
		if (focusTarget) {
			focusTarget.focus();
		}
	});
}

function applyScreenAnimation() {
	app.classList.remove('screen-error');
	app.classList.remove('screen-enter', 'screen-enter--back');
	void app.offsetWidth;
	if (state.lastDirection === 'back') {
		app.classList.add('screen-enter--back');
	} else {
		app.classList.add('screen-enter');
	}
}

function applyErrorAnimation() {
	app.classList.remove('screen-error');
	void app.offsetWidth;
	app.classList.add('screen-error');
	setTimeout(() => {
		app.classList.remove('screen-error');
	}, 320);
}

document.addEventListener('keydown', (event) => {
	const step = steps[state.index];
	const targetTag = event.target && event.target.tagName
		? event.target.tagName.toLowerCase()
		: '';
	if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
		if (step.type !== 'submit') {
			goNext();
		}
	}
	if (event.key === 'Enter' && !event.shiftKey) {
		if (targetTag === 'textarea') return;
		if (step.type !== 'submit') {
			event.preventDefault();
			goNext();
		}
	}
});

render();
