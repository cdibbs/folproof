# FOLProof Language Reference

## Proof steps
Every proof in FOLProof consists of a list of proof steps, where each step has the basic form:

```
[lineNum] [|*] &phi; : reason <NEWLINE>
   ^       ^     ^        ^       ^
   1       2     3        4       5
```

1. Integer line numbers are optional, but recommended. The verifier ignores user line numbers, instead keeping count, itself.
2. Assumption boxes begin with a pipe, like:

   `| &phi; : assumption`.
   
   Nested boxes can be created by adding more pipes:
   
   `|| &phi<sub>2</sub>; : assumption`
   
   They can be ended explicitly, with any number of dashes on a new line, or implicitly, by simply omitting the pipe. See    [Example 1][Example 1] under [Examples].
3. &phi; is a formula in first-order logic. Greater detail can be found under [Formulas][Formulas].
4. Colons separate the formula, &phi;, from the reason it follows logically. See [Justifications][Justifications].
5. Every line is terminated by a newline.


Describing how each proof step should be formed, logically, is beyond the scope of this document.

## Formulas

## Justifications

Justifications are the reasons why your current proof step follows logically from what is already there. They take the form:

```
: ruleName[.var<sub>1</sub>/var<sub>2</sub>] [elim/intro[1/2]] [[(num/range), ]*]
^     ^                    ^                      ^       ^       ^
1     2                    3                      4       5       6
```

1. Justifications are indicated by a leading colon. If omitted, either "premise" or "assumption" will be assumed, depending on the context.
2. Rule names are single words, like "premise" or "and". See [Appendix A][Appendix A], for a complete list.
3. Rules that indicate a variable substitution specify it like `A.x/x0`.
4. Non-derived rules often have elimination or introduction versions, like `&phi; : or elim a,b-c,d-e`. Single letters, like "e" and "i", are valid shorthand.
5. In some cases, rules need to refer to a side, 1 or 2 (left or right), like `&phi,<sub>1</sub>; or &phi;<sub>2</sub> : or i1 n`.
6. Rules that need to reference prior proof steps can do so with a comma-separated list of step numbers and ranges, like `a,b-c,d-e`.

## Examples

### Example 1 - Assumption Boxes
```
1 a or b  : premise
2 ~a      : premise
3 ~b      : premise
4| a      : assumption
5| _|_    : not elim 4,2
 -----------------------
6| b      : assumption
7| _|_    : not elim 6,3
8 _|_     : or elim 1,4-5,6-7
```
Notice how the first assumption is terminated, explicitly, out of necessity, since it would otherwise be difficult to tell there are two assumption boxes. The second box is terminated, implicitly, simply by omitting the leading pipe on line 8.

## Appendix

### Appendix A - A list of justifications accepted by FOLProof
1. And
2. Or
3. Not
4. Implication
5. Forall
6. Exists
7. Copy
