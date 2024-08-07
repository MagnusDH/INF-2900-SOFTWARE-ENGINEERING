describe('userLogged logic correctly', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  });

  it('user can log in', () => {
    cy.contains('Log in').should('exist');   
    cy.contains('Log out').should('not.exist');   
  });

  it('Logged in user can log out', () => {
    window.localStorage.setItem('userLogged', 'true') // Login
    cy.contains('Log out').should('exist');   
    cy.contains('Log in').should('not.exist');   
  })
})