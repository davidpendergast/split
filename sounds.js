class SoundManager {
    
    constructor () {
        this.all_sound_keys = []
    
        this.bad_melody = this._reg("bad_melody.wav");
        this.blips = [];
        this.crust = this._reg("crust.wav");
        this.goods = [];
        this.hits = [];
        this.negatives = [this._reg("negative1.wav"), this._reg("negative2.wav")];
        this.odds = [];
        this.ring = this._reg("ring1.wav");
        this.unrealistic = this._reg("unrealistic.wav");
        this.jingle = this._reg("jingle1.wav");

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
        if (Array.isArray(sound_key)) {
            sound_key = sound_key[Math.floor(sound_key.length * Math.random())]
        }
        // console.log("INFO: playing sound: " + sound_key);
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