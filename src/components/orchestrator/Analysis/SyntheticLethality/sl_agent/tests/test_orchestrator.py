import pandas as pd

from sl_agent.core.models import MutationType, SLQueryInput
from sl_agent.core.orchestrator import get_mutant_wt_lines_for_query


def test_get_mutant_wt_lines_for_query_falls_back_when_group_underpowered(monkeypatch):
    query = SLQueryInput(
        gene="MBD4",
        mutation_type=MutationType.LOF,
        cancer_type="Ovarian Cancer",
    )
    calls = []

    def fake_get_mutant_wt_lines(*, gene, mutation_df, sample_info, cancer_type, mutation_type, cna_df):
        calls.append(cancer_type)
        if cancer_type == "Ovarian Cancer":
            return ["ACH-1", "ACH-2"], ["ACH-WT1"] * 40
        return [f"ACH-M{i}" for i in range(6)], [f"ACH-W{i}" for i in range(60)]

    monkeypatch.setattr(
        "sl_agent.core.orchestrator.get_mutant_wt_lines",
        fake_get_mutant_wt_lines,
    )

    mutant_ids, wt_ids = get_mutant_wt_lines_for_query(
        query,
        pd.DataFrame(),
        pd.DataFrame(),
        None,
    )

    assert calls == ["Ovarian Cancer", None]
    assert len(mutant_ids) == 6
    assert len(wt_ids) == 60


def test_get_mutant_wt_lines_for_query_keeps_cancer_specific_when_group_powered(monkeypatch):
    query = SLQueryInput(
        gene="MBD4",
        mutation_type=MutationType.LOF,
        cancer_type="Ovarian Cancer",
    )
    calls = []

    def fake_get_mutant_wt_lines(*, gene, mutation_df, sample_info, cancer_type, mutation_type, cna_df):
        calls.append(cancer_type)
        return [f"ACH-M{i}" for i in range(5)], [f"ACH-W{i}" for i in range(40)]

    monkeypatch.setattr(
        "sl_agent.core.orchestrator.get_mutant_wt_lines",
        fake_get_mutant_wt_lines,
    )

    mutant_ids, wt_ids = get_mutant_wt_lines_for_query(
        query,
        pd.DataFrame(),
        pd.DataFrame(),
        None,
    )

    assert calls == ["Ovarian Cancer"]
    assert len(mutant_ids) == 5
    assert len(wt_ids) == 40
