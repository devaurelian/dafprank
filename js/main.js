/**
 * Dafprank (https://github.com/AppliberatedHWA/dafprank/)
 * Copyright (c) 2017 Appliberated (https://www.appliberated.com)
 * Licensed under MIT (https://github.com/AppliberatedHWA/dafprank/blob/master/LICENSE)
 */

(function App() {

    "use strict";

    /**
     * The default gain value (1 means no change).
     */
    const DEFAULT_GAIN = 1;

    /**
     * An arbitrary(?) maximum gain value.
     */
    const MAX_GAIN = 100;

    /**
     * The default delay value that has been shown to induce mental stress.
     * @see {@link https://en.wikipedia.org/wiki/Delayed_Auditory_Feedback Wikipedia}
     */
    const DEFAULT_DELAY = 0.175;

    /**
     * The maximum delay value. According to the Web Audio API, must be less than three minutes.
     * @see {@link https://www.w3.org/TR/webaudio/ Web Audio API}
     */
    const MAX_DELAY = (3 * 60) - 1;

    /**
     * Clamps a number within inclusive lower and upper bounds, with a default value for NaN.
     * @param {number} number The number to clamp.
     * @param {number} min The lower bound.
     * @param {number} max The upper bound.
     * @param {number} defaultValue The default value if number is NaN.
     * @returns {number} Returns the clamped number.
     */
    function clampDefault(number, min, max, defaultValue) {
        return isNaN(number) ? defaultValue : Math.min(Math.max(number, min), max);
    }

    /**
     * Parses any delay or gain params from the location query, or returns the default values.
     * @returns {void}
     */
    function parseParams() {
        // Set default gain and delay values
        let delay = DEFAULT_DELAY;
        let gain = DEFAULT_GAIN;

        const query = window.location.search.substring(1);
        if (query.length) {
            // We have parameters, so try to parse them
            const params = query.split("-");
            delay = clampDefault(parseFloat(params[0]), 0, MAX_DELAY, DEFAULT_DELAY);
            gain = clampDefault(parseFloat(params[1]), 0, MAX_GAIN, DEFAULT_GAIN);
        }

        // Return gain and delay
        return { delay, gain };
    }

    /**
     * Creates and returns the speech jammer audio node.
     * @param {AudioContext} audioCtx An AudioContext object.
     * @param {number} gainValue The amount of gain to apply.
     * @param {number} delayValue The amount of delay to apply.
     * @returns {DelayNode} The speech jammer audio node.
     */
    function createJammerNode(audioCtx, gainValue, delayValue) {
        // Create and connect the gain node
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        gain.gain.value = gainValue;

        // Create and connect the delay node
        const delay = audioCtx.createDelay(delayValue);
        delay.connect(gain);
        delay.delayTime.value = delayValue;

        // Return the delay node
        return delay;
    }

    /**
     * Initializes the speech jammer.
     * @returns {void}
     */
    function initJammer() {
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    // Parse params, or use default values
                    const params = parseParams();
                    console.log(params);

                    // Create and connect the speech jammer
                    const audioCtx = new AudioContext();
                    const mediaStreamSource = audioCtx.createMediaStreamSource(stream);
                    const jammerNode = createJammerNode(audioCtx, params.gain, params.delay);
                    mediaStreamSource.connect(jammerNode);
                })
                .catch((err) => console.log(`getUserMedia error: ${err.name} - ${err.message}`));
        } else {
            console.log("getUserMedia not supported on your browser!");
        }
    }

    initJammer();

}());
