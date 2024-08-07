describe('Common register behaviour', () => {
    beforeEach(() => {
      cy.visit('http://localhost:5173/Login/Register')
    });
    
    it('Normal register redirects to login page', () => {
      cy.intercept('POST', 'http://localhost:8000/skooba/register', {
        statusCode: 200,
        body: { message: true },
      }).as('successfulRegister');

      cy.get('input[name="username"]').type('user')
      cy.get('input[name="password"]').type('password')
      cy.contains('Submit').click()
      cy.wait('@successfulRegister').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        cy.contains('Error: ').should('not.exist')
        cy.url().should('eq','http://localhost:5173/Login')
        cy.get('h1').contains('Login').should('exist')
      })
    });

    it('Existing username error, no redirect', () => {
      cy.intercept('POST', 'http://localhost:8000/skooba/register', {
        statusCode: 409,
        body: { message: false },
      }).as('usernameTaken');

      cy.get('input[name="username"]').type('user')
      cy.get('input[name="password"]').type('password')
      cy.contains('Submit').click()
      cy.wait('@usernameTaken').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        cy.contains('Error: Username already taken').should('exist')
        cy.url().should('contain','/Login/Register')
        cy.get('h1').contains('Register').should('exist')
      })
    });

    it('Submit form wihtout value', () => {
      cy.intercept('POST', 'http://localhost:8000/skooba/register', {
        statusCode: 400,
        body: { message: false },
      }).as('usernameTaken');

      cy.contains('Submit').click()
      cy.wait('@usernameTaken').then((interception) => {
        assert.isNotNull(interception.response.body, 'API call has data');
        cy.contains('Error: Invalid input').should('exist')
        cy.url().should('contain','/Login/Register')
        cy.get('h1').contains('Register').should('exist')
      })
    });
  })