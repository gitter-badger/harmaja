import * as B from "lonna"
import { h, mount, ListView, componentScope } from "../../src/index"
import { search } from "./search-engine"

const Root = () =>
    <div id="root">
        <Search/>
    </div>

type SearchState = { state: "initial" } | { state: "searching", searchString: string } | { state: "done", searchString: string, results: string[] }

const Search = () => {
    const searchString = B.atom("")
    const searchStringChange: B.EventStream<string> = searchString.pipe(B.changes, B.debounce(500, componentScope()))
    const searchResult: B.EventStream<string[]> = searchStringChange.pipe(B.flatMapLatest<string, string[]>(s => B.fromPromise(search(s), () => [], xs => xs, error => []), componentScope()))
    
    const state: B.Property<SearchState> = B.update(
        componentScope(),
        { state: "initial"} as SearchState,
        [searchStringChange, (state, searchString) => ({ state: "searching", searchString })],
        [searchResult, searchString, (state, results, searchString) => ({ state: "done", results, searchString})],
    )
    return <div>
        <h1>Cobol search</h1>
        <TextInput value={searchString} placeholder="Enter text to start searching"/>
        <SearchResults state={state} />
    </div>
}

const SearchResults = ({ state } : { state: B.Property<SearchState> }) => {
    const latestResults = state.pipe(
        B.changes, 
        B.scan([], ((results: string[], newState: SearchState) => newState.state === "done" ? newState.results : results), componentScope())        
    )
    
    const message = B.combine(state, latestResults, (s, r) => {
        if (s.state == "done" && r.length === 0) return "Nothing found"
        if (s.state === "searching" && r.length === 0) return "Searching..."
        return ""
    })


    const style = B.combine(state, latestResults, (s, r) => {
        if (s.state === "searching" && r.length > 0) return { opacity: 0.5 }
        return {}
    })
    
    return <div>
        { message }
        <ul style={style}><ListView
            observable={latestResults}
            renderItem={ result => <li>{result}</li>}
        /></ul>

    </div>
}

const SearchResultsSimplest = ({ state } : { state: B.Property<SearchState> }) => {
    const currentResults: B.Property<string[]> = B.map((s: SearchState) => s.state === "done" ? s.results : [])(state)
    const message: B.Property<string> = B.map((r: string[]) => r.length === 0 ? "Nothing found" : null)(currentResults)
    
    return <div>
        { message }
        <ul><ListView
            observable={currentResults}
            renderItem={ result => <li>{result}</li>}
        /></ul>
    </div>
}

const SearchResults2 = ({ state } : { state: B.Property<SearchState> }) => {
    const currentResults: B.Property<string[]> = B.map((s: SearchState) => s.state === "done" ? s.results : [])(state)

    const message: B.Property<string> = B.map((s: SearchState) => {
        if (s.state === "searching") return "Searching..."
        if (s.state === "done" && s.results.length === 0) return "Nothing found."
        return ""
    })(state)
    
    return <div>
        { message }
        <ul><ListView
            observable={currentResults}
            renderItem={ result => <li>{result}</li>}
        /></ul>
    </div>
}

const TextInput = (props: { value: B.Atom<string> } & any) => {
    return <input {...{ 
            type: "text", 
            onInput: e => { 
                props.value.set(e.currentTarget.value)
            },
            ...props, 
            value: props.value 
          }} />  
  };

mount(<Root/>, document.getElementById("root")!)



