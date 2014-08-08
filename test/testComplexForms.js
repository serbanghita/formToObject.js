(function(){

  'use strict';

	/**
	 * Complex forms tests
	 */
	describe('A complex multi-level form', function(){

		beforeEach(function(done) {
			jasmine.getFixtures().fixturesPath = 'fixtures';
			loadFixtures('complex_form1.html');
			done();
		});

		it('should return a normal object when first level elements container is selected', function(done){

			expect(formToObject('firstLevelElements')).toEqual({
				'name': 'Serban',
				'address': 'Place du Casino, 98000 Monaco'
			});

			done();

		});

		it('should return an object with two levels of elements when second level elements container is selected', function(done){

			expect(formToObject('secondLevelElements')).toEqual({
				'settings': {
					'eyesColor': 'brown',
					'hairColor': 'blond',
					'gender': 'male',
					'age': '100'
				}
			});

			done();

		});

		it('should return an object with three levels of elements when third level elements container is selected', function(done){

			expect(formToObject('thirdLevelElements')).toEqual({
				'preferences': {
					'input': {
						'devices': ['mouse', 'keyboard']
					},
					'game': {
						'difficulty': 'hard',
						'upgrades': ['free_amo', 'infinite_life']
					}
				}
			});

			done();

		});

	});


})();