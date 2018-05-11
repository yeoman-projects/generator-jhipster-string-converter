# generator-jhipster-string-converter

Modified from [https://github.com/amitjindal/generator-jhipster-postgresstring-converter](https://github.com/amitjindal/generator-jhipster-postgresstring-converter)

# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-string-converter
```

To update this module:

```bash
npm update -g generator-jhipster-string-converter
```
 
# Generate Result

## Domain

```java

import org.hibernate.annotations.GenericGenerator;

    // ...
    @Id
    @GeneratedValue(generator = "uuid")
	@GenericGenerator(name = "uuid", strategy = "uuid2")
    private String id;

    // ...
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    
```

## Repository

```java
// ...
@SuppressWarnings("unused")
@Repository
public interface AppRepository extends JpaRepository<App, String> {

}
```

## Service

```java 
    /**
     * Get the "id" app.
     *
     * @param id the id of the entity
     * @return the entity
     */
    Optional<App> findOne(String id);

    /**
     * Delete the "id" app.
     *
     * @param id the id of the entity
     */
    void delete(String id);
```

## impl/ServiceImpl

```java 
    /**
     * Get one app by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<App> findOne(String id) {
        log.debug("Request to get App : {}", id);
        return appRepository.findById(id);
    }

    /**
     * Delete the app by id.
     *
     * @param id the id of the entity
     */
    @Override
    public void delete(String id) {
        log.debug("Request to delete App : {}", id);
        appRepository.deleteById(id);
    }

```

## Resource

```java 

    /**
     * GET  /apps/:id : get the "id" app.
     *
     * @param id the id of the app to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the app, or with status 404 (Not Found)
     */
    @GetMapping("/apps/{id}")
    @Timed
    public ResponseEntity<App> getApp(@PathVariable String id) {
        log.debug("REST request to get App : {}", id);
        Optional<App> app = appService.findOne(id);
        return ResponseUtil.wrapOrNotFound(app);
    }

    /**
     * DELETE  /apps/:id : delete the "id" app.
     *
     * @param id the id of the app to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @DeleteMapping("/apps/{id}")
    @Timed
    public ResponseEntity<Void> deleteApp(@PathVariable String id) {
        log.debug("REST request to delete App : {}", id);
        appService.delete(id);
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
    }
```
