describe('Custom workout as expected', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/Random_Workout')
    });

    it('Can select options, and is sent to backend', () => {
        window.localStorage.setItem('userName', 'user1') // Login as user1
        cy.intercept('POST', 'http://localhost:8000/skooba/Random_Workout', {
            statusCode: 201,
            body: 1, //Returns Id 1
          }).as('successfulSave');

        cy.get('[id="react-select-2-input"]').click()
        cy.contains('Volume').click()
        cy.get('[id="react-select-3-input"]').click()
        cy.contains('Chest').click()
        cy.get('[id="react-select-3-input"]').click()
        cy.contains('Legs').click()
        cy.get('input[name="Duration"]').type(40)
        cy.contains('Create workout').click()
        cy.wait('@successfulSave'). then((interception) => {
            assert.isNotNull(interception.response.body, 'API call has data');
            // Verify correct request data is sent
            assert.equal(interception.request.body.muscle_groups.length, 2)
            assert.equal(interception.request.body.workout_duration, "40")
            assert.equal(interception.request.body.workout_type, "Volume")

            cy.url().should('eq','http://localhost:5173/present_workout/1')
        })
    });

    it('Saving with invalid time gives alert error', () => {
        cy.get('[id="react-select-2-input"]').click()
        cy.contains('Volume').click()
        cy.get('[id="react-select-3-input"]').click()
        cy.contains('Chest').click()
        cy.get('input[name="Duration"]').type(5)
        cy.contains('Create workout').click()
    
        // Validate that alert exists with correct message
        cy.on('window:alert',(txt)=>{
          expect(txt).to.contains('Workout duration must be more than 15 minutes.');
        })
    });

    it('Saving with invalid time gives alert error', () => {
        cy.get('input[name="Duration"]').type(40)
        cy.contains('Create workout').click()
    
        // Validate that alert exists with correct message
        cy.on('window:alert',(txt)=>{
          expect(txt).to.contains('Invalid input, please select type and muscle groups');
        })
    });
})