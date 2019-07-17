Feature: cache of actions

  Feature Description

  Scenario: Cach incoming target action
  Scenario: Ignore no target action
  Scenario: Retry cached actions
  Scenario: Remove cached action
  Scenario: Remove old actions

  Background:
    Given target actions config is provided
    And a throttle time config is provided

  Scenario: target action success within cooling time
    Given a target action is dispatched
    When an ACK is dispatched within cooling time
    Then the cached action is not in the cache store

  Scenario: target action fails inside cooling time
    Given a target action is dispatched
    When an NACK is dispatched within cooling time
    Then the cached action is not in the cache store

  Scenario: neither ACK nor NACK after cooling time
    Given a target action is dispatched
    And the cooling time passed
    When a retry all action is dispached
    Then the cached action is retired
    Then and cached action retry time is incremented

  Scenario: neither ACK nor NACK after ttl
    Given a pass ttl cached action
    When a retry action is dispached
    Then all pass ttl cached actions were removed from the store

  Scenario: need to reset the store
    Given a reset is dispatched
    Then the cache store is empied

  Scenario: retry cached actions with on the fly actions
