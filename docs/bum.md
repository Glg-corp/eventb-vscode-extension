# Base file

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<org.eventb.core.machineFile version="5" org.eventb.core.configuration="org.eventb.core.fwd" org.eventb.core.generated="false">
</org.eventb.core.machineFile>
```

# Dans Machine

## Variable

```xml
<org.eventb.core.variable name="1" org.eventb.core.generated="false" org.eventb.core.identifier="ma_variable" />
```

- name: juste faire incrémenter une constante à chaque fois c'est bon
- generated: toujours à false
- indentifier: nom de la variable

## Invariant

```xml
<org.eventb.core.invariant name="2I" org.eventb.core.generated="false" org.eventb.core.label="inv1" org.eventb.core.predicate="ma_variable ∈ BOOL" org.eventb.core.theorem="true" />
```

- name: idem
- generated: idem
- label: nom de la ligne de l'invariant
- predicate: valeur de la condition logique (juste copier le texte dedans)
- theorem: true si y'a le mot-clé "theorem" devant

## Event

```xml
<org.eventb.core.event name="3" org.eventb.core.generated="false" org.eventb.core.convergence="0" org.eventb.core.extended="false" org.eventb.core.label="INITIALISATION">
</org.eventb.core.event>
```

- name: idem
- generated: idem
- convergence: 
    - ordinary=0 (aucun préfixe en camille)
    - convergent=1 (préfixe ``convergent`` en camille)
    - anticipated=2 (préfixe ``anticipated`` en camille)
- extended:
    - false (aucun suffixe ``extends machin``)
    - true (suffixe)
- label: nom de l'event

### Action

```xml
<org.eventb.core.action name="4" org.eventb.core.generated="false" org.eventb.core.label="act1" org.eventb.core.assignment="ma_variable ≔ FALSE"  />
```

- name: idem
- generated: idem
- label: nom de la ligne
- assignment: valeur de la ligne

### Garde

```xml
<org.eventb.core.guard name="5" org.eventb.core.generated="false" org.eventb.core.label="grd1" org.eventb.core.predicate="ma_variable = FALSE"/>
```

- name: idem
- generated: idem
- label: nom de la ligne
- predicate: valeur de la ligne
- theorem: true/false

// invariant -> utiliser le même code avec garde au lieu d'invariant

### Refine (de l'event)

En Camille, c'est le extends (pas de mot-clé refine)

```xml
<org.eventb.core.refinesEvent name="_uyWWoFOFEeq2T67Z3TS7fg" org.eventb.core.target="bob1"/>
```

- name: idem
- target: ce qu'on refine

### Witness

```xml
<org.eventb.core.witness name="_stxF8E82EeqIs6oZfnhpmA" org.eventb.core.generated="false" org.eventb.core.label="new_value" org.eventb.core.predicate="new_value = TRUE ⇔  new_value_colour=green"/>
```

- name: idem
- generated: idem
- label: nom de la ligne
- predicate: valeur de la ligne

### Parameter

```xml
<org.eventb.core.parameter name="_dgxFYE84EeqIs6oZfnhpmA" org.eventb.core.generated="false" org.eventb.core.identifier="new_value_colour"/>
```

- name: idem
- generated: idem
- identifier: nom du paramètre

## Sees context

```xml
<org.eventb.core.seesContext name="_GyTYIE8yEeqIs6oZfnhpmA" org.eventb.core.target="contexte"/>
```

- name: idem
- target: le contexte qu'on montre

## Refine (machine)

```xml
<org.eventb.core.refinesMachine name="_D_t7wE8yEeqIs6oZfnhpmA" org.eventb.core.target="crossroads"/>
```

- name: idem
- target: la machine qu'on refine