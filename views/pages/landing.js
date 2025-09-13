import { USF } from '../../app/States.js';

export function Landing() {	
    const visits = USF.get('landingVisits', 0);

    USF.set('landingVisits', visits + 1);

    return `
        <section class="px-4 md:px-9 py-6 m-auto">
			<div class="flex flex-col justify-center items-center max-w-lg mx-auto">
				<img src="/assets/images/icon.png" alt="icon" class="h-36 w-36 object-contain" />
				<h1 class="text-center text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
					<span class="text-transparent bg-clip-text bg-gradient-to-r from-[#43a0d9] to-sky-500">Stellar</span>SPA
				</h1>
				<p class="text-center">
					A pure JavaScript-based Single Page Web Application (SPA) (no external dependencies) designed to be lightweight, fast, and easy to understand.
				</p>
				<p class="text-center mt-4 text-gray-500">
					This page has been visited <span class="font-semibold">${visits + 1}</span> times.
				</p>
			</div>
		</section>
    `;
}
