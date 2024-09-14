defmodule Earther.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      EartherWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:earther, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Earther.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Earther.Finch},
      # Start a worker by calling: Earther.Worker.start_link(arg)
      # {Earther.Worker, arg},
      # Start to serve requests, typically the last entry
      EartherWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Earther.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    EartherWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
