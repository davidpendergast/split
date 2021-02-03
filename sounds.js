class SoundManager {
    
    constructor () {
        this.bad_melody = "bad_melody.wav";
        this.blips = [];
        this.crust = "crust.wav";
        this.goods = [];
        this.hits = [];
        this.negatives = ["negative1.wav", "negative2.wav"];
        this.odds = [];
        this.ring = "ring1.wav";
        this.unrealistic = "unrealistic.wav";
        this.jingle = "jingle1.wav";

        this.all_sound_keys = []

        this.key_to_sound_obj = new Map();

        var i;
        for (i = 0; i < 14; i++) {
            this.blips.push(this._reg("blip" + (i + 1) + ".wav"));
        }
        for (i = 0; i < 3; i++) {
            this.goods.push(this._reg("good" + (i + 1) + ".wav"));
        }
        for (i = 0; i < 6; i++) {
            this.hits.push(this._reg("hit" + (i + 1) + ".wav"));
        }
        for (i = 0; i < 4; i++) {
            this.odds.push(this._reg("odd" + (i + 1) + ".wav"));
        }
        
        this.active_sound = null;
    }
    
    _reg (key) {
        this.all_sound_keys.push(key);
        return key;
    }
    
    load_sounds (scene) {
        console.log("INFO: initializing sounds...");
        var path = "assets/sounds/nokia3310-soundpack-trix/";
        var sound_map = this.key_to_sound_obj;
        this.all_sound_keys.forEach(function (item, index) {
            var s = scene.load.audio(item, path + item);
            sound_map.set(item, s);
        });
        console.log("INFO: loaded " + sound_map.size + " sound(s).");
    }
    
    play (scene, sound_key) {
        this.play(scene, sound_key, 1);
    }
    
    play (scene, sound_key, volume) {
        console.log("INFO: playing sound: " + sound_key);
        if (this.active_sound != null) {
            this.active_sound.stop();
            this.active_sound = null;
        }
        if (sound_key != null) {
            var config = {volume: volume};
            this.active_sound = scene.sound.add(sound_key, volume);
            this.active_sound.play();
        }
    }
}