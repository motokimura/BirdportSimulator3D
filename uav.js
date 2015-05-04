var Uav = function() {
	
	this.position = new THREE.Vector3();
};

var UavControl = function() {
	
	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	_acceleration = new THREE.Vector3();
	_goal = new THREE.Vector3();
	_last_los = new THREE.Vector3 ();
	
	_cylinder_length = 500;
	_cylinder_radius = 200;
	_layer_number = 5;
	_uav_on_layer = 6;
	_uav_phase = 0;
	
	this.setGoal = function (target)
	{
		_goal = target;
		_last_los.subVectors (_goal, this.position);
	};
	
	this.setPosition = function (position)
	{
		this.position = position;
		_last_los.subVectors (_goal, position);
	};
	
	this.setVelocity = function (velocity)
	{
		this.velocity = velocity;
	};
	
	this.getUavNumber = function ()
	{
		return _layer_number * _uav_on_layer;
	};
	
	this.run = function (uavs)
	{
		this.updateAcceleration ();
		this.move ();
		
		this.arrangeUavs (uavs);
	};
	
	this.updateAcceleration = function ()
	{
		// Propotional Navigation
		var los = new THREE.Vector3();
		los.subVectors (_goal, this.position);
		
		var lambda_sin = new THREE.Vector3();
		lambda_sin.crossVectors(_last_los.normalize(), los.normalize());
		
		var lambda = new THREE.Vector3
		(
			Math.asin (lambda_sin.x),
			Math.asin (lambda_sin.y),
			Math.asin (lambda_sin.z)
		);
		
		_acceleration.crossVectors (lambda, this.velocity);
		_acceleration.multiplyScalar(3);
		
		_last_los = los;
	};
	
	this.move = function ()
	{
		this.velocity.add( _acceleration );
		this.position.add( this.velocity );
		_acceleration.set( 0, 0, 0 );
	};
		
	this.arrangeUavs = function (uavs)
	{
		var phi = Math.atan2(this.velocity.z, this.velocity.x);
		var theta = Math.asin (this.velocity.y / this.velocity.length());
		var euler = new THREE.Euler( 0, -phi, theta, 'XYZ' );
    	
		for (var il = 0; il < _layer_number; il++)
		{	
			for (var iu = 0; iu < _uav_on_layer; iu++)
			{
				var uav = uavs[il*_uav_on_layer + iu];
				
				var int_x = _cylinder_length / (_layer_number - 1);
				uav.position.x = -_cylinder_length / 2 + int_x * (il + 0.5);
				
				var int_theta = 2 * Math.PI / _uav_on_layer;
				var offset = 0;
				if (il % 2 == 0) {
					offset = 2 * Math.PI / _uav_on_layer / 2;
				}
				var theta = offset + iu * int_theta;
				
				uav.position.y = _cylinder_radius * Math.sin(theta + _uav_phase);
				uav.position.z = _cylinder_radius * Math.cos(theta + _uav_phase);
				
				uav.position.applyEuler(euler);
				
				uav.position.add (this.position);
			}
		}
		
		_uav_phase -= 0.01;
	};
};
