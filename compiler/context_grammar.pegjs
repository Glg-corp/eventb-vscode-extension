// Event-B Machine file grammar
// ==========================

Context 
	= _ "context" __ name:Name _ content:ContextContent _ "end" _ {
    	return {name:name, content: content};
    }
    
ContextContent
	= refines:Refines? _ 
	sets:(s:Sets _LB {return s})? _
	constants:Constants? _ axioms:Axioms?
    {
    	return {refines: refines, sets: sets, constants:constants, axioms: axioms};
    }

Sets
	= "sets"  name:(_ UppercaseName)*  {
    	return name.map(elem => elem[1]);
    }
    
Refines
	= "refines" _ target:Name {
    	return {target: target}
    }
    
Constants
	= "constants"  name:(_ Name)*  {
    	return name.map(elem => elem[1]);
    }

Axioms
	= "axioms" _ predicates:(Predicate*) {return predicates;}
 
    
// Base block
    
Predicate "predicate"
	= theorem:"theorem"? __ line:Line {
    	return { label: line.label, predicate: line.assignment, theorem: !!theorem}
    }

Line "label"
	=  "@" label:Name __ (":" __)? assignment:Expression _ {
    	return { label: label, assignment: assignment }
    }
    
Comment "comment"
	= "//" comment:$([^\r\n]*) (_LB / EOF ) { return comment; }
    
Expression "expression"
    = value:$(([^\n\r]  !"//" )+) _LB { return value; }
    
UppercaseName "uppercase name"
  = $([A-Z][A-Z_]*)

Name "identifier" //avoid reserved keywords
  = !"end" !"constants" !"axioms" !"sets"  name:$([a-zA-Z_] [a-zA-Z_0-9]*) {
  	return name;
  }

__ "whitespace"
	= [ \t]*
  
_LB "line break"
	= __ ( Comment / "\r"? "\n")

_ "whitespace or line break"
  = ( Comment / [ \t\n\r] )*
  
EOF "end of file"
	= !.