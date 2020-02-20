// Simple Arithmetics Grammar
// ==========================
//
// Accepts expressions like "2 * (3 + 4)" and computes their value.

Machine 
	= _ "machine" _ name:Name _ content:MachineContent _ "end" _ {
    	return {name:name, content: content};
    }
    
MachineContent
	= refines:Refines? _ sees:Sees? _ variables:Variables? _ invariants:Invariants? _ events:Events?
    {
    	return {refines: refines, sees: sees, variables: variables, invariants: invariants, events: events};
    }

Variables
	= "variables" _ name:(Name _)* {
    	return name.map(elem => elem[0]);
    }
    
Refines
	= "refines" _ target:Name {
    	return {target: target}
    }
    
Sees
	= "sees" _ target:Name {
    	return {target: target}
    }
    
Invariants
	= "invariants" _ line:Predicate+ {
    	return line;
    }


Events
	= "events" _ events:(Event*) { return events; }
    
Event
	= "event" _ name:Name _ refine:(("extends" / "refines") _ Name)? _ 
    	any:Any? _
        where:Where? _ 
		withValue:With? _
        then:Then _
      "end" _ {
      	let target, extended;
        if (refine) {
        	target = refine[2];
            extended = refine[0] === "extends"
        }
    	return {name:name, target: target, extended: !!extended, any: any, where: where, with:withValue, then:then }
    }

// event blocks

Any
	= "any" _ name:(Name _)* {
    	return name.map(elem => elem[0]);
    }
    
Where
	= "where" _ predicate:Predicate+ {
    	return predicate;
    }

With
	= "with" _ line:Line+ {
    	return line;
    }
    
Then
	= "then" _ line:Line+ {
    	return line;
   	}
    
// Base block
    
Predicate
	= theorem:"theorem"? _ line:Line {
    	return { label: line.label, predicate: line.assignment, theorem: !!theorem}
    }

Line
	=  "@" label:Name _ assignment:Expression _ {
    	return { label: label, assignment: assignment }
    }
    
Expression
    = value:$([^\n]+) [\n] { return value; }

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }  

Name
  = !"end" !"invariants" !"events" name:$([a-zA-Z_] [a-zA-Z_0-9]*) {
  	return name;
  }
  
_ "whitespace"
  = [ \t\n\r]*