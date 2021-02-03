
class GameArea {
    
    constructor (xoffs, yoffs, width, height) {
        this.xoffs = xoffs;
        this.yoffs = yoffs;
        this.width = width;
        this.height = height;
    }
    
    top_line() {
        return new Phaser.Geom.Line(0, 0, this.width, 0);
    }
    
    bottom_line() {
        return new Phaser.Geom.Line(0, this.height, this.width, this.height);
    }
    
    left_line() {
        return new Phaser.Geom.Line(0, 0, 0, this.height); 
    }
    
    right_line() {
        return new Phaser.Geom.Line(this.width, 0, this.width, this.height); 
    }
}

class PlayerLine {

    constructor (game_area) {
        this.angle = 0;
        this.length = 100;
        this.game_area = game_area;
        
        this.line_obj = null;
    }
    
    rotate (angle) {
        this.angle += angle
    }
    
    get_center_point () {
        return new Phaser.Geom.Point(this.game_area.width / 2, this.game_area.height / 2);
    }
    
    get_line() {
        var center = this.get_center_point()
        var l1 = new Phaser.Geom.Line(center.x, center.y, 
                center.x + Math.cos(this.angle) * 100, 
                center.y + Math.sin(this.angle) * 100); 
        var l2 = new Phaser.Geom.Line(center.x, center.y, 
                center.x + Math.cos(Math.PI + this.angle) * 100, 
                center.y + Math.sin(Math.PI + this.angle) * 100); 
        return new Phaser.Geom.Line(l1.x2, l1.y2, l2.x2, l2.y2); 
    }
    
    update (scene, tick) {
        var center = this.get_center_point()
        
        if (this.line_obj == null) {
            this.line_obj = scene.add.line(0, 0, 0, 0, 0, 0);
        }
        var line = this.get_line();
        var xoffs = this.game_area.xoffs
        var yoffs = this.game_area.xoffs
        
        this.line_obj.setTo(xoffs + line.x1, yoffs + line.y1, 
                xoffs + line.x2, yoffs + line.y2);
        this.line_obj.setOrigin(0, 0);
        this.line_obj.setStrokeStyle(0, LIGHT, 1);
    }
    
    destroy (scene) {
        if (this.line_obj != null) {
            scene.remove(this.line_obj);
            this.line_obj = null;
        }
    }
}

class Particle {
    constructor(art_id, game_area) {
        this.art_id = art_id;
        this.is_light = true;
        this.game_area = game_area;
        
        this.anim_rate = 10;  // ticks per frame
        this.anim_offset = Math.floor(Math.random() * 100);
        
        this.sprite_obj = null;
    }
    
    get_raw_pos(tick) {
        return new Phaser.Math.Vector2(3, 3);
    }
    
    get_pos(tick) {
        var raw_pos = this.get_raw_pos(tick);
        var x = Math.max(0, Math.min(Math.round(raw_pos.x), this.game_area.width - 1))
        var y = Math.max(0, Math.min(Math.round(raw_pos.y), this.game_area.height - 1))
        return new Phaser.Geom.Point(x, y);
    }
    
    get_anim_frame(tick) {
        var anim_tick = Math.floor(tick / this.anim_rate) + this.anim_offset;
        var frames = PARTICLE_ANIMS[this.art_id];
        return frames[anim_tick % frames.length];
    }
    
    update_texture() {
        var sheet_id = this.is_light ? PARTICLES_SHEET_LIGHT : PARTICLES_SHEET_DARK;
        if (this.sprite_obj != null) {
            this.sprite_obj.setTexture(sheet_id);
        }
    }
    
    update (scene, tick) { 
        if (this.sprite_obj == null) {
            this.sprite_obj = scene.add.sprite(0, 0, PARTICLES_SHEET_LIGHT);
            this.update_texture();
        }
        var pos = this.get_pos(tick)
        var xoffs = this.game_area.xoffs;
        var yoffs = this.game_area.yoffs;
        this.sprite_obj.setPosition(xoffs + pos.x, yoffs + pos.y);
        this.sprite_obj.setFrame(this.get_anim_frame(tick));
    }
    
    destroy (scene) {
        if (this.sprite_obj != null) {
            scene.remove(this.sprite_obj);
            this.sprite_obj = null;
        }
    }
}