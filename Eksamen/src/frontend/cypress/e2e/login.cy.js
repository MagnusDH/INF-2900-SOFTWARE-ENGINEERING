describe('Common login behaviour', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/Login')
    });
    
    it('Normal register redirects to login page', () => {
      cy.intercept('POST', 'http://localhost:8000/skooba/login', {
        statusCode: 200,
        body: { message: true },
      }).as('successfulLogin');

      cy.get('input[name="username"]').type('user')
      cy.get('input[name="password"]').type('password')
      cy.contains('Submit').click()
      cy.wait('@successfulLogin').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        cy.contains('Error: ').should('not.exist')
        // Verify the redirect
        cy.url().should('eq','http://localhost:5173/')
        cy.get('h1').contains('Skooba').should('exist')
        //Verify UI update upon successful login
        cy.contains('Log in').should('not.exist')
        cy.contains('Log out').should('exist')
      })
    });

    it('Wrong password displays error', () => {
      // User is not logged in
      cy.contains('Log in').should('exist')
      cy.contains('Log out').should('not.exist')

      cy.intercept('POST', 'http://localhost:8000/skooba/login', {
        statusCode: 401,
        body: { message: false },
      }).as('wrongPassword');

      cy.get('input[name="username"]').type('user')
      cy.get('input[name="password"]').type('password')
      cy.contains('Submit').click()
      cy.wait('@wrongPassword').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        // Verify no redirect
        cy.url().should('eq','http://localhost:5173/Login')
        // Verify correct error message is displayed
        cy.contains('Error: Incorrect password').should('exist')
        // Verify no UI update
        cy.contains('Log in').should('exist')
        cy.contains('Log out').should('not.exist')
      })
    });

    it('User does not exist error', () => {
      cy.intercept('POST', 'http://localhost:8000/skooba/login', {
        statusCode: 404,
        body: { message: true },
      }).as('usernameNotExists');

      cy.get('input[name="username"]').type('user')
      cy.get('input[name="password"]').type('password')
      cy.contains('Submit').click()
      cy.wait('@usernameNotExists').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        cy.contains('Error: User does not exist').should('exist')
        cy.url().should('eq','http://localhost:5173/Login')
        cy.contains('Log in').should('exist')
        cy.contains('Log out').should('not.exist')
      })
    });
  });