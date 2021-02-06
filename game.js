

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
    
    rand_points(n, unique) {
        var inset = 2;
        if (unique == null || n > (this.width - inset * 2) * (this.height - inset * 2)) {
            unique = false;
        }
        var res = [];
        
        if (unique) {
            var all_pts = []
            for (var x = inset; x < this.width - inset; x++) {
                for (var y = inset; y < this.height - inset; y++) {
                    all_pts.push(new Phaser.Geom.Point(x, y));
                }
            }
            shuffle(all_pts);
            for (var i = 0; i < Math.min(n, all_pts.length); i++) {
                res.push(all_pts[i]);
            }
        } else {
            for (var i = 0; i < n; i++) {
                var x = inset + Math.floor(Math.random() * (this.width - inset));
                var y = inset + Math.floor(Math.random() * (this.height - inset));
                res.push(new Phaser.Geom.Point(x, y));
            }
        }
        return res;
    }
    
    rand_rect() {
        var pts = this.rand_points(2, true); 
        return Phaser.Geom.Rectangle.FromXY(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
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
            this.line_obj.destroy();
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
        this.hidden = false;
    }
    
    set_is_light(val) {
        this.is_light = val;
    }
    
    set_hidden(val) {
        this.hidden = val;
    }
    
    get_raw_pos(tick) {
        return new Phaser.Geom.Point(3, 3);
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
        if (this.sprite_obj == null && !this.hidden) {
            this.sprite_obj = scene.add.sprite(0, 0, PARTICLES_SHEET_LIGHT);
        }
        if (this.hidden && this.sprite_obj != null) {
            this.sprite_obj.destroy();
            this.sprite_obj = null;
        }
        this.update_texture();
        var pos = this.get_pos(tick)
        var xoffs = this.game_area.xoffs;
        var yoffs = this.game_area.yoffs;
        
        if (this.sprite_obj != null) {
            this.sprite_obj.setPosition(xoffs + pos.x, yoffs + pos.y);
            this.sprite_obj.setFrame(this.get_anim_frame(tick));
        }
    }
    
    destroy (scene) {
        if (this.sprite_obj != null) {
            this.sprite_obj.destroy();
            this.sprite_obj = null;
        }
    }
}


class FixedParticle extends Particle {
    
    constructor(x, y, game_area) {
        super(0, game_area);
        this.x = x;
        this.y = y;
    }
    
    get_raw_pos(tick) {
        return new Phaser.Geom.Point(this.x, this.y);
    }
}


class EllipseParticle extends Particle {

    constructor(p1, p2, period_secs, offset, game_area) {
        super(2, game_area);
        this.rect = Phaser.Geom.Rectangle.FromXY(p1.x, p1.y, p2.x, p2.y);
        this.period = period_secs * 30;
        this.offset = offset;
    }
    
    get_raw_pos(tick) {
        var cx = this.rect.centerX;
        var cy = this.rect.centerY;
        var angle = 2 * Math.PI * (this.offset + tick / this.period);
        var x = cx + this.rect.width / 2 * Math.cos(angle);
        var y = cy + this.rect.height / 2 * Math.sin(angle);
        var res = new Phaser.Geom.Point(x, y);
        return res;
    }
}


class ParticleSet {

    constructor(particles) {
        this.particles = particles;
        this.last_tick = 0
    }
    
    update (scene, tick) {
        if (tick == null) {
            tick = this.last_tick;
        }
        this.particles.forEach(function (item, index) {
            item.update(scene, tick);
        })
        this.last_tick = tick;
    }
    
    destroy (scene) {
        this.particles.forEach(function (item, index) {
            item.destroy(scene);
        })
    }
    
    forEach (func) {
        this.particles.forEach(func);
    }
    
    get_particles_relative_to_line (player_line, orientation, tick) {
        if (tick == null) {
            tick = this.last_tick;
        }
        const thresh = 1;
        
        var above = [];
        var below = [];
        var on_line = [];
        
        var line = player_line.get_line();
        
        var center = Phaser.Geom.Line.GetMidPoint(line);
        var normal_x = Phaser.Geom.Line.NormalX(line);
        var normal_y = Phaser.Geom.Line.NormalY(line);
        
        for (var i = 0; i < this.particles.length; i++) {
            var pt = this.particles[i].get_pos(tick);
            if (Phaser.Geom.Line.GetShortestDistance(line, pt) <= thresh) {
                on_line.push(this.particles[i]);
            } else {
                var vx = pt.x - center.x;
                var vy = pt.y - center.y;
                if (vx * normal_x + vy * normal_y > 0) {
                    above.push(this.particles[i]);
                } else {
                    below.push(this.particles[i]);
                }
            }
        }
        
        if (orientation == 0) {
            return on_line;
        } else if (orientation > 0) {
            return above;
        } else {
            return below;
        }
    }
}

const FIXED____ = "FIXED";
const ELLIPSE__ = "ELLIPSE";

const WEIGHTS = new Map();
WEIGHTS.set(FIXED____, [10, 10, 10, 10, 10, 10, 10, 10,  9,  8,  7,  6,  5,  5,  5]);
WEIGHTS.set(ELLIPSE__, [ 0,  0, 5,   7, 10, 15, 20, 15, 15, 15,  5,  5,  5,  5,  5]);

function get_weights_for_level(level_num) {
    var res = new Map();
    WEIGHTS.forEach((function (value, key) {
        if (level_num >= value.length) {
            res.set(key, value[value.length - 1]);
        } else {
            res.set(key, value[level_num]);
        }
    }));
    return res;
}

function select_particle_types_for_level(n, level_num) {
    var weights = get_weights_for_level(level_num);
    var selection_array = []
    weights.forEach((function (value, key) {
        for (var i = 0; i < value; i++) {
            selection_array.push(key);
        }
    }));
    var res = [];
    for (var i = 0; i < n; i++) {
        var r = Math.floor(Math.random() * selection_array.length);
        res.push(selection_array[r]);
    }
    return res;
}

function build_particles(game_area, particle_types) {
    counts = new Map();
    particle_types.forEach((function (value) {
        if (!counts.has(value)) {
            counts.set(value, 0);
        }
        counts.set(value, counts.get(value) + 1);
    }));
    
    var res = [];
    
    if (counts.has(FIXED____)) {
        var pts = game_area.rand_points(counts.get(FIXED____), true);
        for (var i = 0; i < pts.length; i++) {
            res.push(new FixedParticle(pts[i].x, pts[i].y, game_area))
        }
    }
    
    if (counts.has(ELLIPSE__)) {
        var pts = game_area.rand_points(counts.get(ELLIPSE__) * 2, true);
        for (var i = 0; i < pts.length / 2; i++) {
            var p1 = pts[i * 2];
            var p2 = pts[i * 2 + 1];
            var r = Math.random();
            var period = 4
            res.push(new EllipseParticle(p1, p2, period, r, game_area));
        }
    }
    
    return new ParticleSet(res);
}

function gen_num_particles(level_num) {
    var avg = 2 + Math.sqrt(3 * level_num);
    var min = 2
    var variance = Math.floor(level_num / 10);
    var res = Math.max(min, Math.round(avg + 2 * (0.5 - Math.random()) * variance))
    res -= res % 2;
    return res;
}

function gen_level(game_area, level_num) {
    var n_pts = gen_num_particles(level_num);
    var particle_types = select_particle_types_for_level(n_pts, level_num);
    return build_particles(game_area, particle_types);
}