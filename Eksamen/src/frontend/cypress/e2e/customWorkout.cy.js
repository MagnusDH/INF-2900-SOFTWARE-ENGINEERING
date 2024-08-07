describe('Custom workout as expected', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/Workout/CustomWorkout')
    });

    it('Collapseables of site is correct', () => {
      //Muscle groups are not visible until we show them
      cy.get('.muscle-groups').should('not.be.visible')
      cy.contains('Show Exercises').click()
      cy.get('.muscle-groups').should('be.visible')

      //The exercises for muscle groups are not visible until we click the group
      cy.get('.selected_muscle_group_contents').should('not.be.visible')
      cy.contains('Legs').click()
      cy.get('.selected_muscle_group_contents').should('be.visible')

      //Hiding muscle groups removes both
      cy.contains('Hide Exercises').click()
      cy.get('.muscle-groups').should('not.be.visible')
      cy.get('.selected_muscle_group_contents').should('not.be.visible')
    });
    
    it('User can select and deselect exercises from multiple muscle groups', () => {
      //Select 3 exercises from two categories
      cy.contains('Show Exercises').click()
      cy.contains('Legs').click()
      cy.contains('Barbell Squat').click()
      cy.contains('Leg Press').click()
      cy.contains('Arms').click()
      cy.contains('Barbell Curl').click()

      // Overview now displays the three exercises
      cy.get('.selected-exercises-content').find('tbody').should('have.length', 3)

      // Deselect exercise should remove exercise
      cy.get('button').contains('Barbell Curl').click()
      cy.get('.selected-exercises-content').find('tbody').should('have.length', 2)

      //Delete exercise should remove exercise
      cy.contains('Delete').click()
      cy.get('.selected-exercises-content').find('tbody').should('have.length', 1)
    })

    it('Successful save redirects correctly', () => {
      // Database needs to be loadded with fixture data. As workout "1" belongs to "user1"
      cy.intercept('POST', 'http://localhost:8000/skooba/save_workout', {
        statusCode: 201,
        body: {"id": "1"},
      }).as('successfulSave');

      window.localStorage.setItem('userName', 'user1') // Login as user1

      // Name the workout
      cy.get('input').type('cypress test')

      cy.contains('Show Exercises').click()
      cy.contains('Legs').click()
      cy.contains('Barbell Squat').click()

      cy.contains('Create Workout').click()
      cy.wait('@successfulSave').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        
        // Verify corrrect request data is sent
        assert.equal(interception.request.body.exercises.length, 1)
        assert.equal(interception.request.body.name, 'cypress test')

        // Redirects to the correct workout
        cy.url().should('eq','http://localhost:5173/present_workout/1')
      })
    })

    it('Saving without being logged in displays alert error', () => {
      // Name the workout
      cy.get('input').type('cypress test')
      cy.contains('Show Exercises').click()
      cy.contains('Legs').click()
      cy.contains('Barbell Squat').click()
      cy.contains('Create Workout').click()

      // Validate that alert exists with correct message
      cy.on('window:alert',(txt)=>{
        expect(txt).to.contains('Are you logged in?');
      })
    })

    it('Saving without selecting exercises displays alert error', () => {
      cy.get('input').type('cypress test')
      cy.contains('Create Workout').click()
  
      // Validate that alert exists with correct message
      cy.on('window:alert',(txt)=>{
        expect(txt).to.contains('You need to select an exercise');
      })
    })

    it('Saving without naming displays alert error', () => {
      cy.contains('Show Exercises').click()
      cy.contains('Legs').click()
      cy.contains('Barbell Squat').click()
      cy.contains('Create Workout').click()
  
      // Validate that alert exists with correct message
      cy.on('window:alert',(txt)=>{
        expect(txt).to.contains('You need to give the workout a name');
      })
    })
})