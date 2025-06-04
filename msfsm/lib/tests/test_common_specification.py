from msfsm.common.specification import Specification

def test_load():
    spec = Specification()
    spec.load("./tests/data/dag.json")
    assert spec.data.name == "Test"
    assert len(spec.data.automatons) == 5
    assert len(spec.data.required_packages) == 2

def test_get_automaton_order_if_not_dag():
    spec = Specification()
    spec.load("./tests/data/not-dag.json")
    try:
        spec.get_automatons_order()
    except ValueError as e:
        assert str(e) == "The graph is cyclic"

def test_get_automatons_order_if_dag():
    spec = Specification()
    spec.load("./tests/data/dag.json")
    assert spec.get_automatons_order() == {1: [0], 2: [2], 4: [1, 4], 3: [3]}

